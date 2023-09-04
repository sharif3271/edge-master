import { Context, ContextWithRes } from "./base";

export enum InterceptorType {
  Request,
  Response,
}
export interface IInterceptor<T = unknown, U = unknown> {
  type: InterceptorType;
  intercept(ctx: T): Promise<U>;
}
export type IRequestInterceptor = IInterceptor<Context, Request>
export type IResponseInterceptor = IInterceptor<ContextWithRes, Response>