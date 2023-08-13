export abstract class RoutesContainerBase {
  registeredRoutes: IRegisteredRoute[] = [];
  defaultRoute!: RouteHandlerBase;
  route(matcher: Utils.IMatcher, routeHandler: RouteHandlerBase) {
    this.registeredRoutes.push({ matcher, routeHandler });
    return this;
  }
  default(routeHandler: RouteHandlerBase) {
    this.defaultRoute = routeHandler;
    return this;
  }
  abstract handleRequest(request: Request, ctx: ExecutionContext): Promise<Response>
}