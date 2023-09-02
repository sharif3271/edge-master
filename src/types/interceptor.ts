import { Context, ContextWithRes } from "./base";
import { Request, Response } from "@cloudflare/workers-types";

export enum InterceptorType {
  Request,
  Response,
}
export interface IInterceptor<T = unknown, U = unknown> {
  type: InterceptorType;
  intercept(ctx: T): Promise<U>;
}
export interface IRequestInterceptor extends IInterceptor<Context, Request> { }
export interface IResponseInterceptor extends IInterceptor<ContextWithRes, Response> { }