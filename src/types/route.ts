import { IMatcher, ContextWithReq } from "./base";

export interface IRouteHandler {
  execute: (ctx: ContextWithReq) => Promise<Response>;
}
export type Route = {
  matcher: IMatcher;
  routeHandler: IRouteHandler;
}

