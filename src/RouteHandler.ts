import { Task } from "./Task";

export class RouteHandler implements IRouteHandler {

  taskList: Task[] = [];
  registerTask(task: Task): RouteHandler {
    this.taskList.push(task);
    return this;
  }

  async execute({ req, env, ctx }: RouteHandlerExeArgs): Promise<RouteHandlerResponse> {

    /* at least one task should be provided */
    if (!this.taskList.length) throw new Error('Atleast one task should register');

    /* makeing an empty response and options */
    let response = Promise.resolve(new Response());
    let options!: RouteResponseOptions;

    for (const task of this.taskList) {
      const taskReponse = await task.run({ req, env, ctx, res: response });
      response = taskReponse.response;
      let terminateChain = false;
      if (taskReponse.status) {
        switch (taskReponse.status) {
          case TaskStatus.TERMINATE_TASKS:
            terminateChain = true;
            break;
          case TaskStatus.TERMINATE_TASKS_WITH_DEFAULT:
            terminateChain = true;
            options = RouteResponseOptions.continueWithDefault;
            break;
          default:
            break;
        }
      }
      if (terminateChain) {
        break;
      }
    }

    return {
      response,
      options
    }
  }
}