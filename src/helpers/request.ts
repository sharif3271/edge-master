/**
 * Request parsing utilities with error handling
 */

export class RequestParseError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'RequestParseError';
  }
}

/**
 * Parses request body as JSON
 */
export async function parseJSON<T = any>(req: Request): Promise<T> {
  try {
    const text = await req.text();
    if (!text) {
      throw new RequestParseError('Request body is empty');
    }
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof RequestParseError) {
      throw error;
    }
    throw new RequestParseError('Failed to parse JSON', error);
  }
}

/**
 * Parses request body as FormData
 */
export async function parseFormData(req: Request): Promise<FormData> {
  try {
    return await req.formData();
  } catch (error) {
    throw new RequestParseError('Failed to parse FormData', error);
  }
}

/**
 * Parses request body as text
 */
export async function parseText(req: Request): Promise<string> {
  try {
    return await req.text();
  } catch (error) {
    throw new RequestParseError('Failed to parse text', error);
  }
}

/**
 * Parses request body as ArrayBuffer
 */
export async function parseArrayBuffer(req: Request): Promise<ArrayBuffer> {
  try {
    return await req.arrayBuffer();
  } catch (error) {
    throw new RequestParseError('Failed to parse ArrayBuffer', error);
  }
}

/**
 * Parses request body as Blob
 */
export async function parseBlob(req: Request): Promise<Blob> {
  try {
    return await req.blob();
  } catch (error) {
    throw new RequestParseError('Failed to parse Blob', error);
  }
}

/**
 * Parses query parameters from URL
 */
export function parseQuery(req: Request): URLSearchParams {
  const url = new URL(req.url);
  return url.searchParams;
}

/**
 * Gets query parameter as string
 */
export function getQuery(req: Request, key: string): string | null {
  return parseQuery(req).get(key);
}

/**
 * Gets query parameter as string with default value
 */
export function getQueryOr(req: Request, key: string, defaultValue: string): string {
  return parseQuery(req).get(key) || defaultValue;
}

/**
 * Gets all values for a query parameter
 */
export function getQueryAll(req: Request, key: string): string[] {
  return parseQuery(req).getAll(key);
}

/**
 * Checks if a query parameter exists
 */
export function hasQuery(req: Request, key: string): boolean {
  return parseQuery(req).has(key);
}

/**
 * Parses query parameters as an object
 */
export function parseQueryObject(req: Request): Record<string, string | string[]> {
  const params = parseQuery(req);
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of params.entries()) {
    const all = params.getAll(key);
    result[key] = all.length > 1 ? all : value;
  }

  return result;
}
