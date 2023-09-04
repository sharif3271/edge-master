import { TaskConstructArgs, Condition, TaskDuty, TaskContext } from './types/task';

/**
 * Task is a class for defining and executing tasks with optional conditions.
 */
export class Task {
  when?: Condition;
  do!: TaskDuty;
  doThen?: TaskDuty;

  /**
   * Creates a new task with the specified actions and conditions.
   * @param args The arguments to construct the task.
   */
  constructor(args: TaskConstructArgs) {
    this.do = args.do;
    this.when = args.when;
    this.doThen = args.doThen;
  }

  /**
   * Executes the task with the given context and returns a response.
   * @param taskCtx The task context with required properties.
   */
  async run(taskCtx: TaskContext): Promise<Response> {
    if (this.when) {
      if (this.when(taskCtx)) {
        return this.do(taskCtx);
      } else if (this.doThen) {
        return this.doThen(taskCtx);
      }
      return Promise.resolve(taskCtx.res);
    }
    return this.do(taskCtx);
  }
}
