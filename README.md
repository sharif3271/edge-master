<p align="center">
  <a href="https://em.asanflow.com/">
    <img width="450px" src="https://pstorage.asanflow.com/micro-worker/logo-text.svg" alt="EdgeMaster Logo" />
  </a>
</p>

---

<p align="center">
  <a href="https://www.npmjs.com/package/edge-master" target="_blank">
    <img src="https://img.shields.io/npm/v/edge-master.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://deno.bundlejs.com/?q=edge-master" target="_blank">
    <img src="https://deno.bundlejs.com/?q=edge-master&badge&badge-style=flat-square" alt="bundle size" />
  </a>
  <a href="https://github.com/sharif3271/edge-master/actions/workflows/tests.yml" target="_blank">
    <img src="https://img.shields.io/github/actions/workflow/status/sharif3271/edge-master/tests.yml?branch=main&style=flat-square" alt="build status" />
  </a>
  <a href="https://coveralls.io/github/sharif3271/edge-master" target="_blank">
    <img src="https://img.shields.io/coveralls/github/sharif3271/edge-master/main?style=flat-square" alt="code coverage" />
  </a>
  <a href="https://www.npmjs.com/package/edge-master" target="_blank">
    <img src="https://img.shields.io/npm/dw/edge-master?style=flat-square" alt="weekly downloads" />
  </a>
  <a href="https://github.com/sharif3271/edge-master/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/sharif3271/edge-master?style=flat-square" alt="open issues" />
  </a>
</p>

## **The Edge Complexity Problem**

As edge applications grow, managing complexity becomes critical. What starts as a simple Worker with a few routes quickly becomes an unmaintainable mess of if-else statements, scattered middleware, and duplicated logic. EdgeMaster solves this by providing a **structured, scalable architecture** specifically designed for edge computing.

### **Why EdgeMaster?**

<a href="https://em.asanflow.com/" target="_blank">EdgeMaster</a> is a lightweight microframework purpose-built for edge environments like Cloudflare Workers, AWS Lambda@Edge, and other serverless platforms. It brings structure to chaos by providing:

- **🎯 Structured Routing** - HTTP method helpers, grouping, and priority-based matching
- **🔄 Interceptor Pattern** - Middleware for request/response transformation
- **📦 Task-Based Architecture** - Reusable, composable units of work
- **⚡ Zero Dependencies** - No bloat, minimal bundle size (~14 KB)
- **🛡️ Production Ready** - Built-in auth, rate limiting, caching, and error handling
- **💎 Type Safe** - Full TypeScript support with strict typing

---

## **Quick Start**

### Installation

```bash
npm install edge-master
```

### Hello World

```typescript
import { EdgeController, RouteHandler, Task, json } from 'edge-master';

const app = new EdgeController();

app.GET('/hello', new RouteHandler(new Task({
  do: async () => json({ message: 'Hello World!' })
})));

export default {
  fetch: (req: Request) => app.handleRequest({ req })
};
```

That's it! You've built a working edge application.

---

## **Core Features**

### 🎯 **HTTP Method Helpers**

Clean, expressive routing with built-in method helpers:

```typescript
app.GET('/users', listHandler);
app.POST('/users', createHandler);
app.PUT('/users/:id', updateHandler);
app.DELETE('/users/:id', deleteHandler);
```

### 📦 **Route Grouping**

Organize routes hierarchically:

```typescript
app.group('/api/v1', (v1) => {
  v1.group('/users', (users) => {
    users.GET('/', listUsers);
    users.GET('/:id', getUser);
    users.POST('/', createUser);
  });
});
```

### 🔄 **Powerful Interceptors**

Apply cross-cutting concerns with middleware:

```typescript
import { corsInterceptor, jwtInterceptor, rateLimitInterceptor } from 'edge-master';

// CORS
app.addInterceptor(corsInterceptor({ origin: '*' }));

// Authentication
app.addInterceptor(jwtInterceptor({
  verify: (token) => verifyJWT(token, env.JWT_SECRET),
  exclude: ['/auth/*', '/public/*']
}));

// Rate Limiting
app.addInterceptor(rateLimitInterceptor({
  limit: 100,
  window: 60000,
  storage: new KVRateLimitStorage(env.KV)
}));
```

### 📝 **Request & Response Helpers**

Convenient utilities for common operations:

```typescript
import { parseJSON, json, badRequest, notFound } from 'edge-master';

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
```

### 🎭 **Context State Management**

Share data between interceptors and handlers:

```typescript
import { setState, getState } from 'edge-master';

// In interceptor
app.addInterceptor({
  type: InterceptorType.Request,
  async intercept(ctx) {
    setState(ctx, 'user', await authenticateUser(ctx.reqCtx.req));
    return ctx.reqCtx.req;
  }
});

// In handler
app.GET('/profile', new RouteHandler(new Task({
  do: async (ctx) => {
    const user = getState(ctx, 'user');
    return json({ user });
  }
})));
```

---

## **Real-World Example**

Here's a complete REST API with authentication, validation, and error handling:

```typescript
import {
  EdgeController,
  RouteHandler,
  Task,
  json,
  parseJSON,
  corsInterceptor,
  jwtInterceptor,
  getState,
  badRequest,
  notFound,
  unauthorized
} from 'edge-master';

const app = new EdgeController();

// Add interceptors
app.addInterceptor(corsInterceptor({ origin: '*' }));
app.addInterceptor(jwtInterceptor({
  verify: (token) => verifyJWT(token, env.JWT_SECRET),
  exclude: ['/auth/*']
}));

// Public routes
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

// Protected routes
app.GET('/users', new RouteHandler(new Task({
  do: async () => {
    const users = await getUsers();
    return json({ users });
  }
})));

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

app.GET('/users/:id', new RouteHandler(new Task({
  do: async ({ req }) => {
    const id = new URL(req.url).pathname.split('/').pop();
    const user = await getUser(id);

    if (!user) {
      return notFound(`User ${id} not found`);
    }

    return json({ user });
  }
})));

// Export
export default {
  fetch: (request: Request, env: any) => app.handleRequest({ req: request, env })
};
```

---

## **Built-in Interceptors**

EdgeMaster includes production-ready interceptors:

### 🔒 **Authentication**
- **JWT Interceptor** - Token verification with exclude patterns
- **API Key Interceptor** - API key validation

### 🚦 **Rate Limiting**
- Memory or KV-backed storage
- Per-IP or custom key generation
- Configurable limits and windows

### 📝 **Logging**
- Request/response logging
- Configurable log levels
- Timing information

### 🔄 **CORS**
- Full CORS support
- Configurable origins, methods, headers
- Automatic OPTIONS handling

### ⚡ **Caching**
- Cloudflare Cache API integration
- Configurable TTL and cache keys
- Vary header support

---

## **Documentation**

- **[Getting Started](https://em.asanflow.com/docs/getting-started)** - Build your first app
- **[Core Concepts](https://em.asanflow.com/docs/Concepts)** - Understand the architecture
- **[API Reference](https://em.asanflow.com/docs/API-Reference)** - Complete API docs
- **[Examples](https://em.asanflow.com/docs/Examples)** - Real-world examples
- **[Best Practices](https://em.asanflow.com/docs/Best-Practices)** - Recommended patterns
- **[Performance Optimization](https://em.asanflow.com/docs/Performance-Optimization)** - Optimize your app
- **[Troubleshooting](https://em.asanflow.com/docs/Troubleshooting)** - Debug common issues

---

## **Examples & Use Cases**

We provide 10 comprehensive examples covering common patterns:

1. **[API Gateway](https://github.com/sharif3271/edge-master/tree/main/example/01-api-gateway)** - Complete REST API with CRUD operations
2. **[JWT Authentication](https://github.com/sharif3271/edge-master/tree/main/example/02-authentication)** - Full auth system with RBAC
3. **[Caching Strategies](https://github.com/sharif3271/edge-master/tree/main/example/03-caching)** - Edge caching patterns
4. **[Microservices Proxy](https://github.com/sharif3271/edge-master/tree/main/example/04-microservices-proxy)** - Service routing
5. **[Security](https://github.com/sharif3271/edge-master/tree/main/example/05-security)** - Rate limiting & validation
6. **[A/B Testing](https://github.com/sharif3271/edge-master/tree/main/example/06-ab-testing)** - Feature flags
7. **[Image Optimization](https://github.com/sharif3271/edge-master/tree/main/example/07-image-optimization)** - Image transformation
8. **[Workers KV](https://github.com/sharif3271/edge-master/tree/main/example/08-workers-kv)** - KV storage integration
9. **[Workers AI](https://github.com/sharif3271/edge-master/tree/main/example/09-workers-ai)** - AI integration
10. **[RPC Bindings](https://github.com/sharif3271/edge-master/tree/main/example/10-rpc-bindings)** - Service-to-service communication

---

## **Why Choose EdgeMaster?**

### **vs Express.js**
- ✅ Purpose-built for edge environments
- ✅ Zero dependencies vs many
- ✅ ~14 KB bundle vs ~200 KB
- ✅ <1ms cold starts vs slower

### **vs Hono**
- ✅ Task-based architecture for complexity management
- ✅ Built-in production features (auth, rate limiting, caching)
- ✅ Context state management
- ✅ Priority routing

### **vs itty-router**
- ✅ Structured architecture for large applications
- ✅ Rich feature set out of the box
- ✅ Enterprise-ready interceptors
- ✅ Comprehensive TypeScript types

---

## **Roadmap & Future Enhancements**

We're continuously improving EdgeMaster. Here's what's on our radar:

### **Planned Features**
- OpenAPI 3.0 specification generation from routes
- GraphQL adapter for edge
- WebSocket support for Durable Objects
- Built-in observability (tracing, metrics)
- Enhanced D1 database helpers
- R2 storage utilities
- Queue and Pub/Sub integrations
- AI/ML helper utilities
- Edge-native testing framework
- CLI tool for scaffolding projects

### **Improvements**
- Enhanced TypeScript inference
- Performance optimizations
- More built-in interceptors
- Additional example applications
- Video tutorials and guides

**Want to suggest a feature?** [Open an issue](https://github.com/sharif3271/edge-master/issues) or [email us](mailto:sharif3271@gmail.com)!

---

## **Contributing**

We welcome contributions from the community! EdgeMaster is built by developers, for developers.

### **How to Contribute**

1. **Fork the repository** on GitHub
2. **Install dependencies**: `npm install`
3. **Run tests**: `npm run test` (ensure they pass)
4. **Make your changes** with tests
5. **Commit and push** to your fork
6. **Submit a pull request** with a clear description

### **What We're Looking For**

- 🐛 Bug fixes
- ✨ New features (discuss in an issue first)
- 📝 Documentation improvements
- 🧪 Additional test coverage
- 💡 Example applications
- 🎨 Performance optimizations

### **Development Setup**

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/edge-master.git
cd edge-master

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

### **Guidelines**

- Maintain backward compatibility
- Follow existing code style
- Write tests for new features
- Update documentation as needed
- Keep commits focused and clear

---

## **Community & Support**

### **Get Help**

- 📚 **[Documentation](https://em.asanflow.com/)** - Comprehensive guides and API reference
- 💬 **[GitHub Discussions](https://github.com/sharif3271/edge-master/discussions)** - Ask questions and share ideas
- 🐛 **[GitHub Issues](https://github.com/sharif3271/edge-master/issues)** - Report bugs and request features
- 📧 **Email**: [sharif3271@gmail.com](mailto:sharif3271@gmail.com) - Direct support

### **Stay Updated**

- ⭐ **[Star on GitHub](https://github.com/sharif3271/edge-master)** - Show your support
- 👀 **[Watch Releases](https://github.com/sharif3271/edge-master/releases)** - Get notified of new versions
- 🐦 Follow updates on social media

---

## **Credits & Acknowledgments**

EdgeMaster is developed and maintained by **[Sharif Eiri](https://github.com/sharif3271/)**.

### **Philosophy**

EdgeMaster is inspired by the simplicity and elegance of microframeworks like Express.js, but purpose-built for the unique constraints and opportunities of edge computing. Our mission is to bring structure and scalability to edge applications without sacrificing performance.

### **Special Thanks**

- The **Cloudflare Workers** team for building an amazing platform
- The **open-source community** for inspiration and contributions
- All **contributors** who have helped improve EdgeMaster

---

## **License**

EdgeMaster is MIT licensed. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Thank you for choosing EdgeMaster!</strong><br>
  Build amazing edge applications. 🚀<br><br>
  <a href="https://github.com/sharif3271/edge-master">⭐ Star on GitHub</a> •
  <a href="https://em.asanflow.com/">📚 Read the Docs</a> •
  <a href="mailto:sharif3271@gmail.com">📧 Get Support</a>
</p>
