import { IRequestInterceptor, IResponseInterceptor, InterceptorType } from '../types/interceptor';
import { Context, ContextWithRes } from '../types/base';

export interface CacheOptions {
  /**
   * Cache TTL in seconds
   * @default 3600 (1 hour)
   */
  ttl?: number;

  /**
   * Custom cache key generator
   * @default URL of the request
   */
  cacheKey?: (req: Request) => string;

  /**
   * Cache control header value
   */
  cacheControl?: string;

  /**
   * Whether to cache only GET requests
   * @default true
   */
  cacheGetOnly?: boolean;

  /**
   * Function to determine if a response should be cached
   * @default Only cache 200 responses
   */
  shouldCache?: (req: Request, res: Response) => boolean;

  /**
   * Cache name (for Cloudflare)
   * @default 'default'
   */
  cacheName?: string;
}

/**
 * Creates a request interceptor that checks the cache
 */
export function cacheCheckInterceptor(options: CacheOptions = {}): IRequestInterceptor {
  const {
    cacheKey = (req: Request) => req.url,
    cacheGetOnly = true,
    cacheName = 'default',
  } = options;

  return {
    type: InterceptorType.Request,
    async intercept(ctx: Context): Promise<Request> {
      const req = ctx.reqCtx.req;

      // Skip cache for non-GET requests if configured
      if (cacheGetOnly && req.method !== 'GET') {
        return req;
      }

      try {
        const cache = caches.default || await caches.open(cacheName);
        const cacheKeyStr = cacheKey(req);
        const cachedResponse = await cache.match(cacheKeyStr);

        if (cachedResponse) {
          // Found in cache, short-circuit with cached response
          ctx.responder(cachedResponse);
        }
      } catch (error) {
        // Cache API not available or error - continue without cache
        console.warn('Cache check failed:', error);
      }

      return req;
    },
  };
}

/**
 * Creates a response interceptor that stores responses in cache
 */
export function cacheStoreInterceptor(options: CacheOptions = {}): IResponseInterceptor {
  const {
    ttl = 3600,
    cacheKey = (req: Request) => req.url,
    cacheControl,
    cacheGetOnly = true,
    shouldCache = (_req: Request, res: Response) => res.status === 200,
    cacheName = 'default',
  } = options;

  return {
    type: InterceptorType.Response,
    async intercept(ctx: ContextWithRes): Promise<Response> {
      const req = ctx.reqCtx.req;
      const res = ctx.res;

      // Skip cache for non-GET requests if configured
      if (cacheGetOnly && req.method !== 'GET') {
        return res;
      }

      // Check if response should be cached
      if (!shouldCache(req, res)) {
        return res;
      }

      try {
        const cache = caches.default || await caches.open(cacheName);
        const cacheKeyStr = cacheKey(req);

        // Clone response for caching
        const responseToCache = res.clone();

        // Add cache control headers
        const headers = new Headers(responseToCache.headers);
        if (cacheControl) {
          headers.set('Cache-Control', cacheControl);
        } else {
          headers.set('Cache-Control', `public, max-age=${ttl}`);
        }

        const cachedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers,
        });

        // Store in cache (fire and forget)
        ctx.reqCtx.exeCtx?.waitUntil(cache.put(cacheKeyStr, cachedResponse));
      } catch (error) {
        // Cache API not available or error - continue without caching
        console.warn('Cache store failed:', error);
      }

      return res;
    },
  };
}

/**
 * Creates both cache check and store interceptors
 */
export function cacheInterceptor(options: CacheOptions = {}) {
  return {
    check: cacheCheckInterceptor(options),
    store: cacheStoreInterceptor(options),
  };
}

/**
 * Helper to generate cache keys based on URL and query parameters
 */
export function cacheKeyFromUrl(req: Request, includeQuery: boolean = true): string {
  const url = new URL(req.url);
  if (includeQuery) {
    return url.href;
  }
  return `${url.origin}${url.pathname}`;
}

/**
 * Helper to generate cache keys based on URL and specific query parameters
 */
export function cacheKeyWithParams(req: Request, params: string[]): string {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams();

  params.forEach(param => {
    const value = url.searchParams.get(param);
    if (value !== null) {
      searchParams.set(param, value);
    }
  });

  const queryString = searchParams.toString();
  return `${url.origin}${url.pathname}${queryString ? '?' + queryString : ''}`;
}
