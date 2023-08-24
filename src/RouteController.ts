
export class RoutesContainer {

  registeredRoutes: RegisteredRoute[] = [];
  defaultRoute!: IRouteHandler;

  route(matcher: IMatcher, routeHandler: IRouteHandler) {
    this.registeredRoutes.push({ matcher, routeHandler });
    return this;
  }
  default(routeHandler: IRouteHandler) {
    this.defaultRoute = routeHandler;
    return this;
  }

  // executer
  async handleRequest(args: RouteHandlerExeArgs): Promise<Response> {

    const router = this.registeredRoutes.find(r => r.matcher(args.req));

    // if some registered route matches.
    if (router) {
      const { response, options } = await router.routeHandler.execute(args);
      if (options === RouteResponseOptions.CONTINUE_WITH_DEFAULT) {
        return (await this.defaultRoute.execute(args)).response;
      }
      return response;
    }

    return (await this.defaultRoute.execute(args)).response;
  }

}