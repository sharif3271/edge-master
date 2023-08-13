
// Utils
declare type IMatcher = (req: Request) => boolean;




// Tasks
declare enum TaskStatus {
  TERMINATE_TAKS = 'TERMINATE_TAKS',
  TERMINATE_TAKS_WITH_DEFAULT = 'TERMINATE_TAKS_WITH_DEFAULT',
}
declare interface ITaskResponse {
  response: Promise<Response>;
  status?: TaskStatus;
  message?: string;
}
declare type TReqResArgs = {
  req: Request;
  res: Response;
}
declare type TDutyArgs = TReqResArgs & {
  ctx?: ExecutionContext;
  env?: unknown;
}
declare type TTaskDuty = (args: TDutyArgs) => ITaskResponse;
declare type TTaskWhen = (args: TDutyArgs) => boolean;

declare type TaskConstructArgs = {
  do: TTaskDuty;
  when?: TTaskWhen;
  doThen?: TTaskDuty;
}

// Routes
declare type RouteHandlerConstructionArgs = TDutyArgs;

