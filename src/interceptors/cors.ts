import { IResponseInterceptor, InterceptorType } from '../types/interceptor';
import { ContextWithRes } from '../types/base';

export interface CorsOptions {
  /**
   * Access-Control-Allow-Origin header value
   * Can be a string, array of strings, or a function that returns a string
   * @default '*'
   */
  origin?: string | string[] | ((origin: string) => string);

  /**
   * Access-Control-Allow-Methods header value
   * @default 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
   */
  methods?: string | string[];

  /**
   * Access-Control-Allow-Headers header value
   * @default '*'
   */
  allowedHeaders?: string | string[];

  /**
   * Access-Control-Expose-Headers header value
   */
  exposedHeaders?: string | string[];

  /**
   * Access-Control-Max-Age header value (in seconds)
   * @default 86400 (24 hours)
   */
  maxAge?: number;

  /**
   * Access-Control-Allow-Credentials header value
   * @default false
   */
  credentials?: boolean;
}

/**
 * Creates a CORS interceptor with the specified options
 */
export function corsInterceptor(options: CorsOptions = {}): IResponseInterceptor {
  const {
    origin = '*',
    methods = 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    allowedHeaders = '*',
    exposedHeaders,
    maxAge = 86400,
    credentials = false,
  } = options;

  return {
    type: InterceptorType.Response,
    async intercept(ctx: ContextWithRes): Promise<Response> {
      const headers = new Headers(ctx.res.headers);

      // Handle origin
      let allowOrigin = '*';
      if (typeof origin === 'function') {
        const requestOrigin = ctx.reqCtx.req.headers.get('Origin') || '';
        allowOrigin = origin(requestOrigin);
      } else if (Array.isArray(origin)) {
        const requestOrigin = ctx.reqCtx.req.headers.get('Origin') || '';
        if (origin.includes(requestOrigin)) {
          allowOrigin = requestOrigin;
        } else if (origin.length > 0) {
          allowOrigin = origin[0];
        }
      } else {
        allowOrigin = origin;
      }
      headers.set('Access-Control-Allow-Origin', allowOrigin);

      // Handle methods
      const allowMethods = Array.isArray(methods) ? methods.join(', ') : methods;
      headers.set('Access-Control-Allow-Methods', allowMethods);

      // Handle allowed headers
      const allowHeaders = Array.isArray(allowedHeaders) ? allowedHeaders.join(', ') : allowedHeaders;
      headers.set('Access-Control-Allow-Headers', allowHeaders);

      // Handle exposed headers
      if (exposedHeaders) {
        const exposeHeaders = Array.isArray(exposedHeaders) ? exposedHeaders.join(', ') : exposedHeaders;
        headers.set('Access-Control-Expose-Headers', exposeHeaders);
      }

      // Handle max age
      headers.set('Access-Control-Max-Age', maxAge.toString());

      // Handle credentials
      if (credentials) {
        headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return new Response(ctx.res.body, {
        status: ctx.res.status,
        statusText: ctx.res.statusText,
        headers,
      });
    },
  };
}

/**
 * Creates a simple CORS interceptor that allows all origins
 */
export function corsAllowAll(): IResponseInterceptor {
  return corsInterceptor({ origin: '*' });
}
