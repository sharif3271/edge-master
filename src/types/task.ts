import { Response } from '@cloudflare/workers-types';
import { ContextWithReq, ContextWithRes } from './base';


export type TaskContext = ContextWithReq & ContextWithRes;

export type TaskDuty = (args: TaskContext) => Promise<Response>;

export type Condition = (args: TaskContext) => boolean;

export type TaskConstructArgs = {
  do: TaskDuty;
  when?: Condition;
  doThen?: TaskDuty;
}