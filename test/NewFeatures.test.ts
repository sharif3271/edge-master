import 'isomorphic-fetch';
import { EdgeController } from '../src/EdgeController';
import { RouteHandler } from '../src/RouteHandler';
import { Task } from '../src/Task';
import {
  httpMethod,
  and,
  or,
  pathStartWith,
} from '../src/Utils';
import {
  json,
  text,
  html,
  redirect,
  notFound,
  badRequest,
  unauthorized,
} from '../src/helpers/response';
import {
  parseJSON,
  parseText,
  parseQuery,
  getQuery,
  RequestParseError,
} from '../src/helpers/request';
import {
  setState,
  getState,
  hasState,
} from '../src/helpers/context';
import { corsInterceptor } from '../src/interceptors/cors';
import { loggingInterceptor } from '../src/interceptors/logging';
import { IRequestInterceptor, InterceptorType } from '../src/types/interceptor';
import { Context } from '../src/types/base';

describe('New Features', () => {
  describe('Error Handling', () => {
    it('should return 404 response instead of throwing', async () => {
      const app = new EdgeController();
      app.GET('/test', new RouteHandler(new Task({
        do: async () => new Response('Found'),
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/notfound') });
      expect(res.status).toBe(404);
      expect(await res.text()).toBe('Not Found');
    });

    it('should use custom 404 handler', async () => {
      const app = new EdgeController();
      app.onNotFound(async () => new Response('Custom 404', { status: 404 }));

      const res = await app.handleRequest({ req: new Request('https://example.com/notfound') });
      expect(res.status).toBe(404);
      expect(await res.text()).toBe('Custom 404');
    });

    it('should use custom error handler', async () => {
      const app = new EdgeController();
      app.onError(async (error) => new Response(`Error: ${error.message}`, { status: 500 }));
      app.GET('/error', new RouteHandler(new Task({
        do: async () => {
          throw new Error('Test error');
        },
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/error') });
      expect(res.status).toBe(500);
      expect(await res.text()).toBe('Error: Test error');
    });
  });

  describe('HTTP Method Helpers', () => {
    it('should match GET requests', async () => {
      const app = new EdgeController();
      app.GET('/test', new RouteHandler(new Task({
        do: async () => new Response('GET response'),
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/test', { method: 'GET' }) });
      expect(await res.text()).toBe('GET response');
    });

    it('should match POST requests', async () => {
      const app = new EdgeController();
      app.POST('/test', new RouteHandler(new Task({
        do: async () => new Response('POST response'),
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/test', { method: 'POST' }) });
      expect(await res.text()).toBe('POST response');
    });

    it('should not match wrong HTTP method', async () => {
      const app = new EdgeController();
      app.GET('/test', new RouteHandler(new Task({
        do: async () => new Response('GET response'),
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/test', { method: 'POST' }) });
      expect(res.status).toBe(404);
    });
  });

  describe('Route Grouping', () => {
    it('should group routes under a prefix', async () => {
      const app = new EdgeController();

      app.group('/api', (group) => {
        group.GET('/users', new RouteHandler(new Task({
          do: async () => new Response('Users list'),
        })));
        group.GET('/posts', new RouteHandler(new Task({
          do: async () => new Response('Posts list'),
        })));
      });

      const res1 = await app.handleRequest({ req: new Request('https://example.com/api/users', { method: 'GET' }) });
      expect(await res1.text()).toBe('Users list');

      const res2 = await app.handleRequest({ req: new Request('https://example.com/api/posts', { method: 'GET' }) });
      expect(await res2.text()).toBe('Posts list');
    });
  });

  describe('Context State', () => {
    it('should share state between interceptor and handler', async () => {
      const app = new EdgeController();

      const testInterceptor: IRequestInterceptor = {
        type: InterceptorType.Request,
        async intercept(ctx: Context): Promise<Request> {
          setState(ctx, 'testKey', 'testValue');
          return ctx.reqCtx.req;
        },
      };

      app.addInterceptor(testInterceptor);

      app.GET('/test', new RouteHandler(new Task({
        do: async (ctx) => {
          const value = getState(ctx, 'testKey');
          return new Response(value);
        },
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/test', { method: 'GET' }) });
      expect(await res.text()).toBe('testValue');
    });

    it('should check if state exists', async () => {
      const app = new EdgeController();

      app.GET('/test', new RouteHandler(new Task({
        do: async (ctx) => {
          setState(ctx, 'key1', 'value1');
          const exists = hasState(ctx, 'key1');
          const notExists = hasState(ctx, 'key2');
          return new Response(JSON.stringify({ exists, notExists }));
        },
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/test', { method: 'GET' }) });
      const data = JSON.parse(await res.text());
      expect(data.exists).toBe(true);
      expect(data.notExists).toBe(false);
    });
  });

  describe('Response Helpers', () => {
    it('should create JSON response', () => {
      const res = json({ message: 'Hello' });
      expect(res.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create text response', () => {
      const res = text('Hello');
      expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    });

    it('should create HTML response', () => {
      const res = html('<h1>Hello</h1>');
      expect(res.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    });

    it('should create redirect response', () => {
      const res = redirect('https://example.com');
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe('https://example.com');
    });

    it('should create 404 response', () => {
      const res = notFound();
      expect(res.status).toBe(404);
    });

    it('should create 400 response', () => {
      const res = badRequest('Invalid input');
      expect(res.status).toBe(400);
    });

    it('should create 401 response', () => {
      const res = unauthorized();
      expect(res.status).toBe(401);
    });
  });

  describe('Request Parsing', () => {
    it('should parse JSON from request', async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const data = await parseJSON(req);
      expect(data.message).toBe('Hello');
    });

    it('should throw RequestParseError for invalid JSON', async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        body: 'invalid json',
      });

      await expect(parseJSON(req)).rejects.toThrow(RequestParseError);
    });

    it('should parse text from request', async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        body: 'Hello World',
      });

      const text = await parseText(req);
      expect(text).toBe('Hello World');
    });

    it('should parse query parameters', () => {
      const req = new Request('https://example.com?name=John&age=30');
      const params = parseQuery(req);

      expect(params.get('name')).toBe('John');
      expect(params.get('age')).toBe('30');
    });

    it('should get query parameter with helper', () => {
      const req = new Request('https://example.com?name=John');
      const name = getQuery(req, 'name');

      expect(name).toBe('John');
    });
  });

  describe('Route Priorities', () => {
    it('should execute higher priority routes first', async () => {
      const app = new EdgeController();

      // Add catch-all route with low priority (default 0)
      app.addRoute(
        () => true,
        new RouteHandler(new Task({
          do: async () => new Response('Catch all'),
        })),
        0
      );

      // Add specific route with high priority
      app.addRoute(
        pathStartWith('/specific'),
        new RouteHandler(new Task({
          do: async () => new Response('Specific'),
        })),
        10
      );

      const res = await app.handleRequest({ req: new Request('https://example.com/specific') });
      expect(await res.text()).toBe('Specific');
    });
  });

  describe('Matcher Utilities', () => {
    it('should match HTTP method', () => {
      const getMatcher = httpMethod('GET');
      const req1 = new Request('https://example.com', { method: 'GET' });
      const req2 = new Request('https://example.com', { method: 'POST' });

      expect(getMatcher(req1)).toBe(true);
      expect(getMatcher(req2)).toBe(false);
    });

    it('should combine matchers with AND', () => {
      const matcher = and(
        httpMethod('GET'),
        pathStartWith('/api')
      );

      const req1 = new Request('https://example.com/api/users', { method: 'GET' });
      const req2 = new Request('https://example.com/api/users', { method: 'POST' });
      const req3 = new Request('https://example.com/other', { method: 'GET' });

      expect(matcher(req1)).toBe(true);
      expect(matcher(req2)).toBe(false);
      expect(matcher(req3)).toBe(false);
    });

    it('should combine matchers with OR', () => {
      const matcher = or(
        pathStartWith('/api'),
        pathStartWith('/v1')
      );

      const req1 = new Request('https://example.com/api/users');
      const req2 = new Request('https://example.com/v1/users');
      const req3 = new Request('https://example.com/other');

      expect(matcher(req1)).toBe(true);
      expect(matcher(req2)).toBe(true);
      expect(matcher(req3)).toBe(false);
    });
  });

  describe('CORS Interceptor', () => {
    it('should add CORS headers', async () => {
      const app = new EdgeController();
      app.addInterceptor(corsInterceptor({ origin: '*' }));
      app.GET('/test', new RouteHandler(new Task({
        do: async () => new Response('OK'),
      })));

      const res = await app.handleRequest({ req: new Request('https://example.com/test', { method: 'GET' }) });
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should handle array of origins', async () => {
      const app = new EdgeController();
      app.addInterceptor(corsInterceptor({ origin: ['https://example.com', 'https://test.com'] }));
      app.GET('/test', new RouteHandler(new Task({
        do: async () => new Response('OK'),
      })));

      const res = await app.handleRequest({
        req: new Request('https://example.com/test', {
          method: 'GET',
          headers: { 'Origin': 'https://example.com' },
        }),
      });

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
    });
  });

  describe('Logging Interceptor', () => {
    it('should log requests and responses', async () => {
      const logs: string[] = [];
      const logger = (level: string, message: string) => {
        logs.push(`${level}: ${message}`);
      };

      const app = new EdgeController();
      const { request, response } = loggingInterceptor({ logger });

      app.addInterceptor(request);
      app.addInterceptor(response);

      app.GET('/test', new RouteHandler(new Task({
        do: async () => new Response('OK'),
      })));

      await app.handleRequest({ req: new Request('https://example.com/test', { method: 'GET' }) });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(log => log.includes('Incoming request'))).toBe(true);
      expect(logs.some(log => log.includes('Response success'))).toBe(true);
    });
  });
});
