import { Task } from "./Task";
import { ContextWithReq } from "./types/base";
import { IRouteHandler } from './types/route';

/**
 * RouteHandler is a class for executing a series of tasks in response to a matched route.
 */
export class RouteHandler implements IRouteHandler {
  taskList: Task[] = [];

  /**
   * Registers a task to be executed when this route handler is invoked.
   * @param task The task to register.
   */
  registerTask(task: Task): RouteHandler {
    this.taskList.push(task);
    return this;
  }

  /**
   * Executes the registered tasks with the given context and returns a response.
   * @param ctx The request context with required properties.
   */
  async execute(ctx: ContextWithReq): Promise<Response> {
    try {
      let res = new Response();
      for (const task of this.taskList) {
        res = await task.run({ ...ctx, res });
      }
      return res;
    } catch (error) {
      // Handle any errors that occur during task execution here.
      console.error(`RouteHandler execution error: ${error}`);
      throw error; // Rethrow the error to propagate it.
    }
  }
}
