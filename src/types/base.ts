


export type IMatcher = (req: Request) => boolean;

export type RequestHandlerArgs<T = any> = {
  req: Request;
  env?: T;
  exeCtx?: ExecutionContext;
}
export type Context = {
  reqCtx: RequestHandlerArgs;
  responder: (res: Response | PromiseLike<Response>) => void;
}
export type ContextWithReq = Context & {
  req: Request;
}
export type ContextWithRes = Context & {
  res: Response | Promise<Response>;
}