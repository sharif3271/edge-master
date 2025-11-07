import { Task } from "./Task";
import { IMatcher } from './types/base';


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
 * Creates a matcher for a specific HTTP method
 */
export const httpMethod = (method: string): IMatcher => (req: Request) => {
  return req.method === method.toUpperCase();
}

/**
 * Combines multiple matchers with AND logic
 */
export const and = (...matchers: IMatcher[]): IMatcher => (req: Request) => {
  return matchers.every(matcher => matcher(req));
}

/**
 * Combines multiple matchers with OR logic
 */
export const or = (...matchers: IMatcher[]): IMatcher => (req: Request) => {
  return matchers.some(matcher => matcher(req));
}