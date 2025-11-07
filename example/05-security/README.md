# Rate Limiting & Security Example

Complete security implementation with rate limiting, API keys, and security headers.

## Features
- Rate limiting per IP address
- API key authentication
- Security headers (CSP, HSTS, etc.)
- CORS configuration
- Request size limits
- DDoS protection patterns

## Usage
```typescript
import { rateLimitInterceptor, apiKeyInterceptor, KVRateLimitStorage } from 'edge-master';

// Rate limiting
app.addInterceptor(rateLimitInterceptor({
  requests: 100,
  window: 60000,
  storage: new KVRateLimitStorage(env.RATE_LIMIT_KV)
}));

// API key auth
app.addInterceptor(apiKeyInterceptor({
  verify: (key) => validateApiKey(key, env.API_KEYS)
}));
```

## Learn
- Rate limiting strategies
- API key management
- Security best practices
- DDoS mitigation

*Full implementation coming soon. See `example/README.md` for patterns.*
