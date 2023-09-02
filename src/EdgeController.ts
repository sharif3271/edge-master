import { Response, Request } from '@cloudflare/workers-types';
import { Route, IRouteHandler } from './types/route';
import { RequestHandlerArgs, Context, ContextWithRes, ContextWithReq, IMatcher } from './types/base';
import { IRequestInterceptor, IResponseInterceptor, IInterceptor, InterceptorType } from './types/interceptor';



/**
 * EdgeController is a class for managing routes and interceptors in Cloudflare Workers.
 */
export class EdgeController {

  private _reqInterceptors: IRequestInterceptor[] = [];
  private _hasReqInterceptor = false;
  private _resInterceptors: IResponseInterceptor[] = [];
  private _hasResInterceptor = false;
  private _routes: Route[] = [];

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
   * If no route matches, it falls back to fetching the original request.
   */
  private async handleRoutes(ctx: ContextWithReq): Promise<Response> {
    const route = this._routes.find(r => r.matcher(ctx.req));
    if (route) {
      return route.routeHandler.execute(ctx);
    } else {
      // Fallback to fetching the original request if no route matches.
      return fetch(ctx.req);
    }
  }

  /**
   * Adds a new route to the router.
   * @param matcher The route matcher function.
   * @param routeHandler The route handler to execute when the route matches.
   */
  addRoute(matcher: IMatcher, routeHandler: IRouteHandler): EdgeController {
    this._routes.push({
      matcher,
      routeHandler
    });
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
   * Handles an incoming request and returns the response.
   * @param reqCtx The request context.
   */
  async handleRequest(reqCtx: RequestHandlerArgs): Promise<Response> {
    return new Promise(async (responder) => {
      try {
        responder(
          await this.interceptResponse({
            reqCtx,
            responder,
            res: await this.handleRoutes({
              req: await this.interceptRequest({ reqCtx, responder }),
              reqCtx,
              responder,
            })
          })
        );
      } catch (error) {
        // Handle any uncaught errors here, e.g., log or respond with an error.
        console.error(`Request handling error: ${error}`);
        responder(new Response('Internal Server Error', { status: 500 }));
      }
    });
  }
}