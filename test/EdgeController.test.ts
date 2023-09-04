import 'isomorphic-fetch';
import { EdgeController } from '../src/EdgeController';
import {
  IRequestInterceptor,
  IResponseInterceptor,
  IRouteHandler,
  IMatcher,
  InterceptorType,
} from '../src/types';


describe('EdgeController', () => {
  let edgeController!: EdgeController;

  beforeEach(() => {
    // Initialize a new EdgeController instance before each test.
    edgeController = new EdgeController();
  });

  it('should add a route and execute it', async () => {
    // Define a sample route and route handler.
    const routeMatcher = (req: Request) => {
      const { pathname } = new URL(req.url);
      return pathname.startsWith('/test');
    };
    const routeHandler: IRouteHandler = {
      execute: async (ctx) => {
        return new Response('Route Handler Response');
      },
    };
    const defaultHandler: IRouteHandler = {
      execute: async (ctx) => {
        return new Response('Default Handler Response');
      },
    };

    // Add the route to the EdgeController.
    edgeController.addRoute(routeMatcher, routeHandler);
    edgeController.addRoute(() => true, defaultHandler);

    // sample request context.
    const reqCtx = { req: new Request('https://example.com/test') };
    const req2Ctx = { req: new Request('https://example.com/should-skip') };

    // Call handleRequest and capture the response.
    const response = await edgeController.handleRequest(reqCtx);

    // Assert that the response matches the expected result.
    expect(await response.text()).toBe('Route Handler Response');

    // Call handleRequest with a request that will not match with any route.
    const defaultRes = await edgeController.handleRequest(req2Ctx);
    expect(await defaultRes.text()).toBe('Default Handler Response');
  });

  it('should add a request interceptor and intercept the request', async () => {
    // Define a sample request interceptor.
    const requestInterceptor: IRequestInterceptor = {
      type: InterceptorType.Request,
      intercept: async (ctx) => {
        // Modify the request, for example, add a custom header.
        ctx.reqCtx.req.headers.set('X-Custom-Header', 'Intercepted');
        return ctx.reqCtx.req as any;
      },
    };

    // Add the request interceptor to the EdgeController.
    edgeController.addInterceptor(requestInterceptor);
    const defaultHandler: IRouteHandler = {
      execute: async (ctx) => {
        const reqHeaders = ctx.req.headers;
        return new Response('Default Handler Response', {
          headers: {
            'X-Custom-Header': reqHeaders.get('X-Custom-Header') || ''
          }
        });
      },
    };

    // Add the route to the EdgeController.
    edgeController.addRoute(() => true, defaultHandler);

    // Define a sample request context.
    const reqCtx = { req: new Request('https://example.com/default') };
    // Call handleRequest and capture the response.
    const response = await edgeController.handleRequest(reqCtx);

    // Assert that the modified request header is present in the response.
    expect((response.headers.get('X-Custom-Header'))).toBe('Intercepted');
  });

  it('should respond a request immediately after calling responder', async () => {

    const interceptor1: IRequestInterceptor = {
      type: InterceptorType.Request,
      intercept: async (ctx) => {
        ctx.reqCtx.req.headers.set('X-Custom-Header', 'Intercepted');
        return ctx.reqCtx.req as any;
      },
    };
    // will responde immediately.
    const interceptor2: IRequestInterceptor = {
      type: InterceptorType.Request,
      intercept: async (ctx) => {
        if (ctx.reqCtx.req.headers.get('X-Custom-Header') === 'Intercepted') {
          ctx.responder(new Response('responder works'));
        }
        return ctx.reqCtx.req as any;
      },
    };

    // Add the request interceptor to the EdgeController.
    edgeController.addInterceptor(interceptor1);
    edgeController.addInterceptor(interceptor2);

    // Define a sample request context.
    const reqCtx = { req: new Request('https://example.com/default') };
    // Call handleRequest and capture the response.
    const response = await edgeController.handleRequest(reqCtx);

    // Assert that the modified request header is present in the response.
    expect(await response.text()).toBe('responder works');
  });

  it('should handle uncaught errors and respond with an error message', async () => {
    // Define a route handler that throws an error.
    const errorRouteHandler: IRouteHandler = {
      execute: async () => {
        throw new Error('Test: Route Handler Error');
      },
    };

    // Add the error-inducing route to the EdgeController.
    edgeController.addRoute(() => true, errorRouteHandler);

    // Define a sample request context.
    const reqCtx = { req: new Request('https://example.com/') };

    // Call handleRequest and capture the response.
    const response = await edgeController.handleRequest(reqCtx);

    // Assert that the response indicates an internal server error.
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
  
});
