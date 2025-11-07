/**
 * Response helper utilities to reduce boilerplate
 */

/**
 * Creates a JSON response
 */
export function json(data: any, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

/**
 * Creates a text response
 */
export function text(content: string, init?: ResponseInit): Response {
  return new Response(content, {
    ...init,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

/**
 * Creates an HTML response
 */
export function html(content: string, init?: ResponseInit): Response {
  return new Response(content, {
    ...init,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

/**
 * Creates a redirect response
 */
export function redirect(url: string, status: number = 302): Response {
  return new Response(null, {
    status,
    headers: {
      'Location': url,
    },
  });
}

/**
 * Creates a 404 Not Found response
 */
export function notFound(message: string = 'Not Found'): Response {
  return new Response(message, { status: 404 });
}

/**
 * Creates a 400 Bad Request response
 */
export function badRequest(message: string = 'Bad Request'): Response {
  return json({ error: message }, { status: 400 });
}

/**
 * Creates a 401 Unauthorized response
 */
export function unauthorized(message: string = 'Unauthorized'): Response {
  return json({ error: message }, { status: 401 });
}

/**
 * Creates a 403 Forbidden response
 */
export function forbidden(message: string = 'Forbidden'): Response {
  return json({ error: message }, { status: 403 });
}

/**
 * Creates a 500 Internal Server Error response
 */
export function serverError(message: string = 'Internal Server Error'): Response {
  return json({ error: message }, { status: 500 });
}

/**
 * Creates a 204 No Content response
 */
export function noContent(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Creates a response with custom status and JSON body
 */
export function jsonWithStatus(data: any, status: number, init?: ResponseInit): Response {
  return json(data, { ...init, status });
}
