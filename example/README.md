# EdgeMaster Examples

Complete, production-ready examples demonstrating EdgeMaster features.

## 🚀 Getting Started

Each example is self-contained with its own `README.md`, `package.json`, and `wrangler.toml`.

### Setup

```bash
cd example/[example-name]
npm install
npm run dev
```

---

## 📚 Available Examples

### 1. **API Gateway** (`01-api-gateway/`)

Complete REST API with CRUD operations.

**Features:**
- HTTP method helpers (GET, POST, PUT, DELETE)
- Request body parsing
- Query parameters
- Input validation
- CORS support
- Error handling

**Endpoints:**
- `GET /api/users` - List users (with pagination)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Learn:** Basic routing, request/response handling, validation

---

### 2. **JWT Authentication** (`02-authentication/`)

Complete auth system with JWT tokens.

**Features:**
- User registration & login
- JWT token generation
- Protected routes
- Role-based access control (RBAC)
- Token refresh
- Password hashing

**Endpoints:**
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /profile` - Protected profile
- `GET /admin/users` - Admin-only endpoint

**Learn:** JWT interceptor, authentication patterns, RBAC

---

### 3. **Caching Strategy** (`03-caching/`)

Advanced caching with Cloudflare Cache API.

**Features:**
- Cache API integration
- Custom cache keys
- TTL configuration
- Conditional caching
- Cache warming

**Learn:** `cacheInterceptor`, cache key generation, performance optimization

---

### 4. **Microservices Proxy** (`04-microservices-proxy/`)

API gateway for routing to multiple services.

**Features:**
- Service routing
- Request transformation
- Response aggregation
- Load balancing
- Circuit breaker pattern

**Learn:** Route grouping, request proxying, error handling

---

### 5. **Rate Limiting & Security** (`05-security/`)

Complete security implementation.

**Features:**
- Rate limiting (per IP)
- API key authentication
- Security headers
- CORS configuration
- Request validation
- DDoS protection patterns

**Learn:** `rateLimitInterceptor`, `apiKeyInterceptor`, security best practices

---

### 6. **A/B Testing** (`06-ab-testing/`)

Feature flags and A/B testing implementation.

**Features:**
- Traffic splitting
- Cookie-based routing
- Variant assignment
- Analytics integration
- Progressive rollout

**Learn:** Context state, conditional routing, cookies

---

### 7. **Image Optimization** (`07-image-optimization/`)

On-the-fly image transformation.

**Features:**
- Resize & crop
- Format conversion (WebP, AVIF)
- Quality optimization
- Caching strategies
- Cloudflare Images integration

**Learn:** Binary data handling, cache strategies, CDN patterns

---

### 8. **Workers KV Integration** (`08-workers-kv/`)

Persistent storage with Cloudflare KV.

**Features:**
- Session management
- Feature flags
- Configuration storage
- User preferences
- Distributed caching

**Learn:** KV namespace binding, data persistence, TTL management

---

### 9. **Workers AI Integration** (`09-workers-ai/`)

AI-powered features with Cloudflare Workers AI.

**Features:**
- Text generation
- Sentiment analysis
- Content classification
- Translation
- Summarization

**Learn:** AI model integration, streaming responses, prompt engineering

---

### 10. **RPC Service Bindings** (`10-rpc-bindings/`)

Inter-worker communication with RPC.

**Features:**
- Service-to-service communication
- Type-safe RPC calls
- WorkerEntrypoint pattern
- Service composition
- Error handling

**Learn:** RPC bindings, service architecture, type safety

---

## 🎯 Quick Start Guide

### Choose Your Path

**New to EdgeMaster?**
Start with: `01-api-gateway` → `02-authentication` → `05-security`

**Building an API?**
Focus on: `01-api-gateway`, `02-authentication`, `03-caching`, `05-security`

**Microservices Architecture?**
Check out: `04-microservices-proxy`, `10-rpc-bindings`

**Performance Optimization?**
Look at: `03-caching`, `07-image-optimization`

**Advanced Features?**
Explore: `08-workers-kv`, `09-workers-ai`, `10-rpc-bindings`

---

## 🛠 Common Patterns

### Basic Setup

```typescript
import { EdgeController, RouteHandler, Task, json } from 'edge-master';

const app = new EdgeController();

app.GET('/hello', new RouteHandler(new Task({
  do: async () => json({ message: 'Hello World' })
})));

export default {
  fetch: (req: Request) => app.handleRequest({ req })
};
```

### With Interceptors

```typescript
import {
  corsInterceptor,
  loggingInterceptor,
  jwtInterceptor
} from 'edge-master';

// CORS
app.addInterceptor(corsInterceptor({ origin: '*' }));

// Logging
const { request, response } = loggingInterceptor();
app.addInterceptor(request);
app.addInterceptor(response);

// Authentication
app.addInterceptor(jwtInterceptor({
  verify: async (token) => verifyJWT(token, secret),
  exclude: ['/public/*']
}));
```

### Route Grouping

```typescript
app.group('/api/v1', (api) => {
  api.GET('/users', usersHandler);
  api.GET('/posts', postsHandler);
});
```

### Error Handling

```typescript
app.onError(async (error) =>
  json({ error: error.message }, { status: 500 })
);

app.onNotFound(async () =>
  json({ error: 'Not found' }, { status: 404 })
);
```

---

## 📖 Learning Resources

### Documentation
- [EdgeMaster Docs](https://em.asanflow.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community
- [GitHub Issues](https://github.com/sharif3271/edge-master/issues)
- [Discussions](https://github.com/sharif3271/edge-master/discussions)

---

## 🤝 Contributing

Found a bug or want to add an example? Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Add your example with README
4. Test thoroughly
5. Submit a pull request

---

## 📝 Example Template

Each example should include:

```
example/XX-example-name/
├── README.md           # Detailed explanation
├── package.json        # Dependencies
├── wrangler.toml       # Cloudflare config
├── tsconfig.json       # TypeScript config
├── .dev.vars.example   # Environment variables (if needed)
└── src/
    └── index.ts        # Main implementation
```

---

## 🎓 Best Practices

1. **Error Handling** - Always use try-catch and custom error handlers
2. **Validation** - Validate all user input
3. **Security** - Use HTTPS, CORS, rate limiting
4. **Performance** - Leverage caching where possible
5. **Type Safety** - Use TypeScript for better DX
6. **Testing** - Test locally before deploying
7. **Monitoring** - Add logging for debugging

---

## 🚀 Deployment

All examples can be deployed to Cloudflare Workers:

```bash
cd example/[example-name]
npm run deploy
```

Make sure to:
1. Set up your Cloudflare account
2. Install Wrangler CLI
3. Configure environment variables
4. Review wrangler.toml settings

---

## 💡 Tips

- Start with simple examples and progress to advanced
- Read the source code - it's heavily commented
- Modify examples to fit your use case
- Check the main docs for detailed API reference
- Join the community for help and discussions

---

Happy coding with EdgeMaster! 🎉
