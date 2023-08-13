



export module Routes {
  // based this options routeContainer decides what to do with req and res
  export enum Options {
    continueWithDefault,
  }
  // this is what a Route handler executer should return
  export interface IRouteHandlerResponse {
    data: Response;
    options?: Options;
    errorMessage?: string;
  }
  export interface IRegisteredRoute {
    matcher: Utils.IMatcher;
    routeHandler: RouteHandlerBase;
  }

  export abstract class RouteHandlerBase {
    taskList: TasksModule.Task[] = [];
    registerTask(task: TasksModule.Task): RouteHandlerBase {
      this.taskList.push(task);
      return this;
    }
    abstract execute(req: Request, ctx: ExecutionContext): Promise<IRouteHandlerResponse>
  }
}