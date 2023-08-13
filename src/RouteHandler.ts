import { Task } from "./Task";

export class RouteHandler {

  taskList: Task[] = [];
  registerTask(task: Task): RouteHandler {
    this.taskList.push(task);
    return this;
  }

  async execute(args: TDutyArgs): Promise<Routes.IRouteHandlerResponse> {
    if (!this.taskList.length) throw new Error('Atleast one task should register');
    let hadlerResponse = new Response();
    let options!: Routes.Options;
    for (const task of this.taskList) {
      const taskReponse = await task.run(req, hadlerResponse, ctx);
      hadlerResponse = taskReponse.data;
      let terminateChain = false; 
      if (taskReponse.options) {
        switch (taskReponse.options) {
          case TasksModule.TaskResOptions.terminateWithCurrent:
            terminateChain = true;
            break;
          case TasksModule.TaskResOptions.terminateWithDefault:
            terminateChain = true;
            options = Routes.Options.continueWithDefault;
            break;
          case TasksModule.TaskResOptions.terminateWithError:
            terminateChain = true;
            hadlerResponse = new Response(taskReponse.errorMessage || 'Request Faild!', {
              status: 421,
            });
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
      data: hadlerResponse,
      options
    }
  }
}