import React from 'react'

export const features = [
  {
    icon: '⚡',
    title: 'Zero Dependencies',
    description: (
      <>
        Only ~14 KB bundle size with zero production dependencies. Fast cold starts and minimal overhead.
      </>
    ),
  },
  {
    icon: '🎯',
    title: 'HTTP Method Helpers',
    description: (
      <>
        Clean, expressive routing with GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS helpers.
      </>
    ),
  },
  {
    icon: '🔄',
    title: 'Built-in Interceptors',
    description: (
      <>
        Production-ready middleware: JWT auth, CORS, rate limiting, caching, and logging out of the box.
      </>
    ),
  },
  {
    icon: '📦',
    title: 'Route Grouping',
    description: (
      <>
        Organize large applications with hierarchical route grouping and nested prefixes.
      </>
    ),
  },
  {
    icon: '💎',
    title: 'Full Type Safety',
    description: (
      <>
        Complete TypeScript support with strict typing and intelligent IDE autocompletion.
      </>
    ),
  },
  {
    icon: '🎭',
    title: 'Context State',
    description: (
      <>
        Share data between interceptors and handlers with built-in state management.
      </>
    ),
  },
  {
    icon: '🧩',
    title: 'Task Composition',
    description: (
      <>
        Reusable, composable units of work with conditional execution and error handling.
      </>
    ),
  },
  {
    icon: '🛡️',
    title: 'Production Ready',
    description: (
      <>
        Built-in error handling, validation helpers, and 94.65% test coverage.
      </>
    ),
  },
]

// Modern code examples
export const HelloWorldExample = `import { EdgeController, RouteHandler, Task, json } from 'edge-master';

const app = new EdgeController();

app.GET('/hello', new RouteHandler(new Task({
  do: async () => json({ message: 'Hello World!' })
})));

export default {
  fetch: (req) => app.handleRequest({ req })
};`

export const RestAPIExample = `import { EdgeController, RouteHandler, Task, json, parseJSON, badRequest, notFound } from 'edge-master';

const app = new EdgeController();

// List all users
app.GET('/users', new RouteHandler(new Task({
  do: async () => {
    const users = await getUsers();
    return json({ users });
  }
})));

// Create user with validation
app.POST('/users', new RouteHandler(new Task({
  do: async ({ req }) => {
    const body = await parseJSON(req);

    if (!body.email || !body.name) {
      return badRequest('Email and name are required');
    }

    const user = await createUser(body);
    return json({ user }, { status: 201 });
  }
})));

// Get user by ID
app.GET('/users/:id', new RouteHandler(new Task({
  do: async ({ req }) => {
    const id = new URL(req.url).pathname.split('/').pop();
    const user = await getUser(id);

    if (!user) {
      return notFound(\`User \${id} not found\`);
    }

    return json({ user });
  }
})));

export default {
  fetch: (req) => app.handleRequest({ req })
};`

export const AuthenticationExample = `import { EdgeController, RouteHandler, Task, json, parseJSON,
         jwtInterceptor, corsInterceptor, getState, unauthorized } from 'edge-master';

const app = new EdgeController();

// Add CORS
app.addInterceptor(corsInterceptor({ origin: '*' }));

// Add JWT authentication (exclude /auth routes)
app.addInterceptor(jwtInterceptor({
  verify: (token) => verifyJWT(token, env.JWT_SECRET),
  exclude: ['/auth/*']
}));

// Public login endpoint
app.POST('/auth/login', new RouteHandler(new Task({
  do: async ({ req }) => {
    const { email, password } = await parseJSON(req);
    const token = await generateToken(email, password);

    if (!token) {
      return unauthorized('Invalid credentials');
    }

    return json({ token });
  }
})));

// Protected endpoint - requires JWT
app.GET('/profile', new RouteHandler(new Task({
  do: async (ctx) => {
    const user = getState(ctx, 'user');
    return json({ user });
  }
})));

export default {
  fetch: (req, env) => app.handleRequest({ req, env })
};`

export const ProductionExample = `import { EdgeController, RouteHandler, Task, json,
         corsInterceptor, jwtInterceptor, rateLimitInterceptor,
         loggingInterceptor, KVRateLimitStorage } from 'edge-master';

const app = new EdgeController();

// 1. CORS - Allow all origins
app.addInterceptor(corsInterceptor({
  origin: '*',
  credentials: true
}));

// 2. Rate Limiting - 100 requests per minute
app.addInterceptor(rateLimitInterceptor({
  limit: 100,
  window: 60000,
  storage: new KVRateLimitStorage(env.RATE_LIMIT_KV)
}));

// 3. JWT Authentication
app.addInterceptor(jwtInterceptor({
  verify: (token) => verifyJWT(token, env.JWT_SECRET),
  exclude: ['/auth/*', '/public/*']
}));

// 4. Request/Response Logging
const { request, response } = loggingInterceptor({
  level: 'info',
  logTiming: true
});
app.addInterceptor(request);
app.addInterceptor(response);

// Define your routes
app.group('/api/v1', (api) => {
  api.GET('/users', listUsersHandler);
  api.POST('/users', createUserHandler);
});

// Custom error handlers
app.onNotFound(() => json({ error: 'Not Found' }, { status: 404 }));
app.onError((err) => json({ error: err.message }, { status: 500 }));

export default {
  fetch: (req, env) => app.handleRequest({ req, env })
};`

// Keep for backward compatibility but mark as legacy
export const ComponentTestingExample = HelloWorldExample

// Comparison data
export const comparisonData = [
  {
    feature: 'Bundle Size',
    edgemaster: '~14 KB',
    express: '~200 KB',
    hono: '~12 KB',
    ittyRouter: '~450 bytes'
  },
  {
    feature: 'Dependencies',
    edgemaster: '0',
    express: 'Many',
    hono: '0',
    ittyRouter: '0'
  },
  {
    feature: 'Cold Start',
    edgemaster: '<1ms',
    express: 'Slower',
    hono: '<1ms',
    ittyRouter: '<1ms'
  },
  {
    feature: 'Built-in Auth',
    edgemaster: '✅ JWT & API Key',
    express: '❌ Requires packages',
    hono: '❌ Basic only',
    ittyRouter: '❌'
  },
  {
    feature: 'Rate Limiting',
    edgemaster: '✅ Built-in',
    express: '❌ Requires packages',
    hono: '❌',
    ittyRouter: '❌'
  },
  {
    feature: 'Route Grouping',
    edgemaster: '✅',
    express: '✅',
    hono: '✅',
    ittyRouter: '❌'
  },
  {
    feature: 'TypeScript',
    edgemaster: '✅ Full support',
    express: '⚠️ Partial',
    hono: '✅ Full support',
    ittyRouter: '✅ Full support'
  },
  {
    feature: 'Best For',
    edgemaster: 'Complex apps',
    express: 'Node.js servers',
    hono: 'Simple edge apps',
    ittyRouter: 'Minimal routing'
  }
]
