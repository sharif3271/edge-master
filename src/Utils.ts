import { Task } from "./Task";


/**
 * pattern ex: '*foo*bar*' for maching 'XXXfooXXbarXX'
 */
export const routePattern = (pattern: string): IMatcher => {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = new RegExp("^".concat(escapedPattern.replace(/\\\*/g, '.*'), "$"));
  return (req: Request) => {
    return regexPattern.test(req.url);
  }
}
export const urlStartWith = (urlStartingWith: string): IMatcher => (req: Request) => {
  return req.url.startsWith(urlStartingWith);
}
export const pathStartWith = (urlStartingWith: string): IMatcher => (req: Request) => {
  return new URL(req.url).pathname.startsWith(urlStartingWith);
}


/**
 * build in tasks
 */
export const terminare = (when: TTaskWhen, ignoreCurrentRes = false) => {
  return new Task({
    do: ({res}) => ({
      response: Promise.resolve(res),
      staus: ignoreCurrentRes ? TaskStatus.TERMINATE_TAKS_WITH_DEFAULT : TaskStatus.TERMINATE_TAKS,
    }),
    when,
  });
}
export const initResponse = () => {
  return new Task({
    do: ({req}) => ({
      response: fetch(req),
    })
  });
}