
export class Task {
  when?: TTaskWhen;
  do!: TTaskDuty;
  doThen?: TTaskDuty;
  constructor(args: TaskConstructArgs) {
    this.do = args.do;
    this.when = args.when;
    this.doThen = args.doThen;
  }
  run(args: TDutyArgs): Promise<ITaskResponse> {
    if (this.when) {
      if (this.when(args)) {
        return this.do(args);
      } else if (this.doThen) {
        return this.doThen(args);
      }
      return Promise.resolve({
        response: args.res,
      });
    }
    return this.do(args);
  }
}