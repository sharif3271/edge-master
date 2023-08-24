/// <reference types="@cloudflare/workers-types" />

// Utils
declare type IMatcher = (req: Request) => boolean;




// Tasks
declare enum TaskStatus {
  TERMINATE_TASKS = 'TERMINATE_TASKS',
  TERMINATE_TASKS_WITH_DEFAULT = 'TERMINATE_TASKS_WITH_DEFAULT',
}
declare interface ITaskResponse {
  response: Promise<Response>;
  status?: TaskStatus;
  message?: string;
}
declare type TReqResArgs = {
  req: Request;
  res: Promise<Response>;
}
declare type TDutyArgs = TReqResArgs & {
  ctx?: ExecutionContext;
  env?: unknown;
}
declare type TTaskDuty = (args: TDutyArgs) => Promise<ITaskResponse>;
declare type TTaskWhen = (args: TDutyArgs) => boolean;

declare type TaskConstructArgs = {
  do: TTaskDuty;
  when?: TTaskWhen;
  doThen?: TTaskDuty;
}



// Routes
declare type RouteHandlerExeArgs = {
  req: Request;
  ctx?: ExecutionContext;
  env?: unknown;
};
declare enum RouteResponseOptions {
  CONTINUE_WITH_DEFAULT = 'CONTINUE_WITH_DEFAULT',
}
// this is what a Route handler executer should return
declare type RouteHandlerResponse = {
  response: Promise<Response>;
  options?: RouteResponseOptions;
  message?: string;
}
declare interface IRouteHandler {
  execute: (args: RouteHandlerExeArgs) => Promise<RouteHandlerResponse>;
}
declare type RegisteredRoute = {
  matcher: IMatcher;
  routeHandler: IRouteHandler;
}

