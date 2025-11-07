import { IRequestInterceptor, InterceptorType } from '../types/interceptor';
import { Context } from '../types/base';

export interface JWTPayload {
  [key: string]: any;
}

export interface JWTOptions {
  /**
   * Function to verify and decode JWT token
   * Should throw an error if token is invalid
   */
  verify: (token: string) => Promise<JWTPayload> | JWTPayload;

  /**
   * Function to extract token from request
   * @default Extracts from Authorization header (Bearer token)
   */
  getToken?: (req: Request) => string | null;

  /**
   * Paths to exclude from JWT authentication
   * Can be exact paths or patterns
   */
  exclude?: string[] | ((req: Request) => boolean);

  /**
   * Custom response when authentication fails
   */
  onAuthenticationFailed?: (req: Request, error: Error) => Response;

  /**
   * Key to store decoded JWT payload in context state
   * @default 'user'
   */
  stateKey?: string;
}

const defaultGetToken = (req: Request): string | null => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  // Support "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  // Support direct token
  return authHeader;
};

const defaultOnAuthenticationFailed = (req: Request, error: Error): Response => {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: error.message || 'Invalid or missing authentication token',
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
      },
    }
  );
};

/**
 * Creates a JWT authentication interceptor
 *
 * Example usage:
 * ```typescript
 * import { jwtInterceptor } from 'edge-master/interceptors';
 *
 * // Using a JWT library like jose
 * const jwt = jwtInterceptor({
 *   verify: async (token) => {
 *     const { payload } = await jwtVerify(token, secret);
 *     return payload;
 *   },
 *   exclude: ['/public', '/login'],
 * });
 *
 * app.addInterceptor(jwt);
 * ```
 */
export function jwtInterceptor(options: JWTOptions): IRequestInterceptor {
  const {
    verify,
    getToken = defaultGetToken,
    exclude,
    onAuthenticationFailed = defaultOnAuthenticationFailed,
    stateKey = 'user',
  } = options;

  const shouldExclude = (req: Request): boolean => {
    if (!exclude) return false;

    if (typeof exclude === 'function') {
      return exclude(req);
    }

    const url = new URL(req.url);
    return exclude.some(pattern => {
      // Exact match
      if (url.pathname === pattern) return true;

      // Prefix match
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return url.pathname.startsWith(prefix);
      }

      return false;
    });
  };

  return {
    type: InterceptorType.Request,
    async intercept(ctx: Context): Promise<Request> {
      const req = ctx.reqCtx.req;

      // Skip authentication for excluded paths
      if (shouldExclude(req)) {
        return req;
      }

      try {
        // Extract token
        const token = getToken(req);
        if (!token) {
          throw new Error('No authentication token provided');
        }

        // Verify and decode token
        const payload = await verify(token);

        // Store payload in context state
        ctx.state.set(stateKey, payload);

        return req;
      } catch (error) {
        // Authentication failed
        ctx.responder(onAuthenticationFailed(req, error as Error));
        return req; // This won't be used as responder short-circuits
      }
    },
  };
}

/**
 * Helper to create a simple API key authentication interceptor
 */
export interface ApiKeyOptions {
  /**
   * Function to verify API key
   * Should return true if valid, false otherwise
   */
  verify: (apiKey: string) => Promise<boolean> | boolean;

  /**
   * Header name to extract API key from
   * @default 'X-API-Key'
   */
  headerName?: string;

  /**
   * Paths to exclude from API key authentication
   */
  exclude?: string[] | ((req: Request) => boolean);

  /**
   * Custom response when authentication fails
   */
  onAuthenticationFailed?: (req: Request) => Response;
}

export function apiKeyInterceptor(options: ApiKeyOptions): IRequestInterceptor {
  const {
    verify,
    headerName = 'X-API-Key',
    exclude,
    onAuthenticationFailed = (req: Request) => {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid or missing API key',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    },
  } = options;

  const shouldExclude = (req: Request): boolean => {
    if (!exclude) return false;

    if (typeof exclude === 'function') {
      return exclude(req);
    }

    const url = new URL(req.url);
    return exclude.some(pattern => {
      if (url.pathname === pattern) return true;
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return url.pathname.startsWith(prefix);
      }
      return false;
    });
  };

  return {
    type: InterceptorType.Request,
    async intercept(ctx: Context): Promise<Request> {
      const req = ctx.reqCtx.req;

      // Skip authentication for excluded paths
      if (shouldExclude(req)) {
        return req;
      }

      const apiKey = req.headers.get(headerName);

      if (!apiKey) {
        ctx.responder(onAuthenticationFailed(req));
        return req;
      }

      try {
        const isValid = await verify(apiKey);
        if (!isValid) {
          ctx.responder(onAuthenticationFailed(req));
        }
      } catch (error) {
        ctx.responder(onAuthenticationFailed(req));
      }

      return req;
    },
  };
}
