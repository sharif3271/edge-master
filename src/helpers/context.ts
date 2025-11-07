import { Context } from '../types/base';

/**
 * Sets a value in the context state
 */
export function setState<T = any>(ctx: Context, key: string, value: T): void {
  ctx.state.set(key, value);
}

/**
 * Gets a value from the context state
 */
export function getState<T = any>(ctx: Context, key: string): T | undefined {
  return ctx.state.get(key) as T | undefined;
}

/**
 * Gets a value from the context state or returns a default value
 */
export function getStateOr<T = any>(ctx: Context, key: string, defaultValue: T): T {
  return ctx.state.has(key) ? (ctx.state.get(key) as T) : defaultValue;
}

/**
 * Checks if a key exists in the context state
 */
export function hasState(ctx: Context, key: string): boolean {
  return ctx.state.has(key);
}

/**
 * Deletes a value from the context state
 */
export function deleteState(ctx: Context, key: string): boolean {
  return ctx.state.delete(key);
}

/**
 * Clears all values from the context state
 */
export function clearState(ctx: Context): void {
  ctx.state.clear();
}
