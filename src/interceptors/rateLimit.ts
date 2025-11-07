import { IRequestInterceptor, InterceptorType } from '../types/interceptor';
import { Context } from '../types/base';

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the window
   * @default 100
   */
  requests?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  window?: number;

  /**
   * Function to generate a key for rate limiting (e.g., by IP, user ID)
   * @default IP address from CF-Connecting-IP header
   */
  keyGenerator?: (req: Request) => string;

  /**
   * Storage adapter for rate limit data
   */
  storage?: RateLimitStorage;

  /**
   * Custom response when rate limit is exceeded
   */
  onRateLimitExceeded?: (req: Request, resetTime: number) => Response;
}

export interface RateLimitStorage {
  /**
   * Get current request count and reset time for a key
   */
  get(key: string): Promise<{ count: number; resetTime: number } | null>;

  /**
   * Increment request count for a key
   */
  increment(key: string, resetTime: number): Promise<{ count: number; resetTime: number }>;
}

/**
 * In-memory storage for rate limiting (for development/testing)
 * Note: This is not suitable for production with multiple workers
 */
export class MemoryRateLimitStorage implements RateLimitStorage {
  private storage = new Map<string, { count: number; resetTime: number }>();

  async get(key: string) {
    const data = this.storage.get(key);
    if (!data) return null;

    // Clean up expired entries
    if (Date.now() > data.resetTime) {
      this.storage.delete(key);
      return null;
    }

    return data;
  }

  async increment(key: string, resetTime: number) {
    const existing = await this.get(key);

    if (existing) {
      existing.count++;
      this.storage.set(key, existing);
      return existing;
    }

    const newData = { count: 1, resetTime };
    this.storage.set(key, newData);
    return newData;
  }
}

/**
 * KV-based storage for rate limiting (for Cloudflare Workers)
 */
export class KVRateLimitStorage implements RateLimitStorage {
  constructor(private kv: KVNamespace) {}

  async get(key: string) {
    const value = await this.kv.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  async increment(key: string, resetTime: number) {
    const existing = await this.get(key);

    if (existing && Date.now() < existing.resetTime) {
      existing.count++;
      const ttl = Math.ceil((existing.resetTime - Date.now()) / 1000);
      await this.kv.put(key, JSON.stringify(existing), { expirationTtl: ttl });
      return existing;
    }

    const newData = { count: 1, resetTime };
    const ttl = Math.ceil((resetTime - Date.now()) / 1000);
    await this.kv.put(key, JSON.stringify(newData), { expirationTtl: ttl });
    return newData;
  }
}

const defaultKeyGenerator = (req: Request): string => {
  // Try to get IP from Cloudflare header
  const ip = req.headers.get('CF-Connecting-IP') ||
             req.headers.get('X-Forwarded-For') ||
             'unknown';
  return `ratelimit:${ip}`;
};

const defaultOnRateLimitExceeded = (req: Request, resetTime: number): Response => {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  );
};

/**
 * Creates a rate limiting interceptor
 */
export function rateLimitInterceptor(options: RateLimitOptions = {}): IRequestInterceptor {
  const {
    requests = 100,
    window = 60000, // 1 minute
    keyGenerator = defaultKeyGenerator,
    storage = new MemoryRateLimitStorage(),
    onRateLimitExceeded = defaultOnRateLimitExceeded,
  } = options;

  return {
    type: InterceptorType.Request,
    async intercept(ctx: Context): Promise<Request> {
      const req = ctx.reqCtx.req;
      const key = keyGenerator(req);
      const now = Date.now();
      const resetTime = now + window;

      try {
        const data = await storage.increment(key, resetTime);

        // Add rate limit headers to the response
        ctx.state.set('__rateLimitData', {
          limit: requests,
          remaining: Math.max(0, requests - data.count),
          reset: data.resetTime,
        });

        if (data.count > requests) {
          // Rate limit exceeded
          ctx.responder(onRateLimitExceeded(req, data.resetTime));
        }
      } catch (error) {
        // If rate limiting fails, log and continue (fail open)
        console.error('Rate limiting error:', error);
      }

      return req;
    },
  };
}

/**
 * Response interceptor to add rate limit headers
 */
export function rateLimitHeadersInterceptor() {
  return {
    type: InterceptorType.Response,
    async intercept(ctx: any): Promise<Response> {
      const rateLimitData = ctx.state.get('__rateLimitData');

      if (rateLimitData) {
        const headers = new Headers(ctx.res.headers);
        headers.set('X-RateLimit-Limit', rateLimitData.limit.toString());
        headers.set('X-RateLimit-Remaining', rateLimitData.remaining.toString());
        headers.set('X-RateLimit-Reset', new Date(rateLimitData.reset).toISOString());

        return new Response(ctx.res.body, {
          status: ctx.res.status,
          statusText: ctx.res.statusText,
          headers,
        });
      }

      return ctx.res;
    },
  };
}
