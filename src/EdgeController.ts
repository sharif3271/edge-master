import { Route, IRouteHandler } from './types/route';
import { RequestHandlerArgs, Context, ContextWithRes, ContextWithReq, IMatcher } from './types/base';
import { IRequestInterceptor, IResponseInterceptor, IInterceptor, InterceptorType } from './types/interceptor';
import { and, httpMethod, pathStartWith } from './Utils';



/**
 * EdgeController is a class for managing routes and interceptors in Cloudflare Workers.
 */
export class EdgeController {

  private _reqInterceptors: IRequestInterceptor[] = [];
  private _hasReqInterceptor = false;
  private _resInterceptors: IResponseInterceptor[] = [];
  private _hasResInterceptor = false;
  private _routes: Route[] = [];
  private _notFoundHandler?: (ctx: ContextWithReq) => Promise<Response>;
  private _errorHandler?: (error: Error, ctx: Context) => Promise<Response>;

  constructor() { }

  /**
   * Intercepts incoming requests, applies request interceptors, and returns the modified request.
   */
  private async interceptRequest(ctx: Context): Promise<Request> {
    if (!this._hasReqInterceptor) return ctx.reqCtx.req;
    let req = new Request(ctx.reqCtx.req);
    for (const interceptor of this._reqInterceptors) {
      try {
        req = await interceptor.intercept({ ...ctx, reqCtx: { ...ctx.reqCtx, req } });
      } catch (error) {
        // Handle interceptor errors here, e.g., log or respond with an error.
        console.error(`Request interceptor error: ${error}`);
        throw error; // Rethrow the error to propagate it.
      }
    }
    return req;
  }

  /**
   * Intercepts outgoing responses, applies response interceptors, and returns the modified response.
   */
  private async interceptResponse(ctx: ContextWithRes): Promise<Response> {
    if (!this._hasResInterceptor) return ctx.res;
    let res = ctx.res;
    for (const interceptor of this._resInterceptors) {
      try {
        res = await interceptor.intercept({ ...ctx, res });
      } catch (error) {
        // Handle interceptor errors here, e.g., log or respond with an error.
        console.error(`Response interceptor error: ${error}`);
        throw error; // Rethrow the error to propagate it.
      }
    }
    return res;
  }

  /**
   * Handles incoming requests by matching routes and executing the appropriate route handler.
   * If no route matches, it falls back to the custom notFoundHandler or returns a 404 response.
   */
  private async handleRoutes(ctx: ContextWithReq): Promise<Response> {
    const route = this._routes.find(r => r.matcher(ctx.req));
    if (route) {
      return route.routeHandler.execute(ctx);
    } else {
      // Use custom 404 handler if provided, otherwise return default 404
      if (this._notFoundHandler) {
        return this._notFoundHandler(ctx);
      }
      return new Response('Not Found', { status: 404 });
    }
  }

  /**
   * Adds a new route to the router.
   * @param matcher The route matcher function.
   * @param routeHandler The route handler to execute when the route matches.
   * @param priority Optional priority (higher values are matched first, default: 0).
   */
  addRoute(matcher: IMatcher, routeHandler: IRouteHandler, priority: number = 0): EdgeController {
    this._routes.push({
      matcher,
      routeHandler,
      priority,
    });
    // Sort routes by priority (higher priority first)
    this._routes.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return this;
  }

  /**
   * Adds an interceptor to the router.
   * @param interceptor The interceptor to add.
   */
  addInterceptor(interceptor: IInterceptor): EdgeController {
    if (interceptor.type === InterceptorType.Request) {
      this._reqInterceptors.push(interceptor as IRequestInterceptor);
      if (!this._hasReqInterceptor) this._hasReqInterceptor = true;
    }
    if (interceptor.type === InterceptorType.Response) {
      this._resInterceptors.push(interceptor as IResponseInterceptor);
      if (!this._hasResInterceptor) this._hasResInterceptor = true;
    }
    return this;
  }

  /**
   * Sets a custom handler for 404 Not Found responses.
   * @param handler The handler function to execute when no route matches.
   */
  onNotFound(handler: (ctx: ContextWithReq) => Promise<Response>): EdgeController {
    this._notFoundHandler = handler;
    return this;
  }

  /**
   * Sets a custom error handler for uncaught errors.
   * @param handler The handler function to execute when an error occurs.
   */
  onError(handler: (error: Error, ctx: Context) => Promise<Response>): EdgeController {
    this._errorHandler = handler;
    return this;
  }

  /**
   * Adds a GET route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  GET(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('GET'), pathStartWith(path)), routeHandler);
  }

  /**
   * Adds a POST route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  POST(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('POST'), pathStartWith(path)), routeHandler);
  }

  /**
   * Adds a PUT route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  PUT(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('PUT'), pathStartWith(path)), routeHandler);
  }

  /**
   * Adds a DELETE route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  DELETE(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('DELETE'), pathStartWith(path)), routeHandler);
  }

  /**
   * Adds a PATCH route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  PATCH(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('PATCH'), pathStartWith(path)), routeHandler);
  }

  /**
   * Adds a HEAD route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  HEAD(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('HEAD'), pathStartWith(path)), routeHandler);
  }

  /**
   * Adds an OPTIONS route.
   * @param path The path to match (will be matched as path prefix).
   * @param routeHandler The route handler to execute.
   */
  OPTIONS(path: string, routeHandler: IRouteHandler): EdgeController {
    return this.addRoute(and(httpMethod('OPTIONS'), pathStartWith(path)), routeHandler);
  }

  /**
   * Groups routes under a common path prefix.
   * @param prefix The path prefix for all routes in the group.
   * @param configure A function that receives a new EdgeController for adding grouped routes.
   */
  group(prefix: string, configure: (group: EdgeController) => void): EdgeController {
    const groupController = new EdgeController();
    configure(groupController);

    // Add all routes from the group with the prefix
    for (const route of groupController._routes) {
      const prefixedMatcher: IMatcher = (req: Request) => {
        const url = new URL(req.url);
        if (url.pathname.startsWith(prefix)) {
          // Create a modified request with the prefix removed for matching
          const modifiedUrl = new URL(req.url);
          modifiedUrl.pathname = url.pathname.substring(prefix.length) || '/';
          const modifiedReq = new Request(modifiedUrl, req);
          return route.matcher(modifiedReq);
        }
        return false;
      };

      this._routes.push({
        matcher: prefixedMatcher,
        routeHandler: route.routeHandler,
      });
    }

    return this;
  }

  /**
   * Handles an incoming request and returns the response.
   * @param reqCtx The request context.
   */
  async handleRequest(reqCtx: RequestHandlerArgs): Promise<Response> {
    return new Promise(async (responder) => {
      // Initialize state for sharing data across middleware and handlers
      const state = new Map<string, any>();

      try {
        responder(
          await this.interceptResponse({
            reqCtx,
            responder,
            state,
            res: await this.handleRoutes({
              req: await this.interceptRequest({ reqCtx, responder, state }),
              reqCtx,
              responder,
              state,
            })
          })
        );
      } catch (error) {
        // Use custom error handler if provided
        if (this._errorHandler) {
          try {
            responder(await this._errorHandler(error as Error, { reqCtx, responder, state }));
          } catch (handlerError) {
            // If error handler itself fails, return 500
            responder(new Response('Internal Server Error', { status: 500 }));
          }
        } else {
          // Default error response
          responder(new Response('Internal Server Error', { status: 500 }));
        }
      }
    });
  }
}