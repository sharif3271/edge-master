# Caching Strategy Example

Demonstrates caching patterns with Cloudflare Cache API and EdgeMaster.

## Features

- ✅ Cache API integration
- ✅ Custom cache key generation
- ✅ TTL configuration
- ✅ Cache-Control headers
- ✅ Conditional caching
- ✅ Cache warming strategies

## Running

```bash
npm install
npm run dev
```

## Endpoints

- `GET /api/data` - Cached for 1 hour
- `GET /api/data/:id` - Cached per ID
- `POST /api/cache/purge` - Clear specific cache
- `GET /no-cache/data` - Never cached

## Cache Strategies

1. **Time-based** - Cache for fixed duration
2. **Param-based** - Cache based on URL params
3. **User-based** - Cache per user (authenticated)
4. **Stale-while-revalidate** - Serve stale while fetching fresh

## Code Example

```typescript
import { cacheInterceptor, cacheKeyFromUrl } from 'edge-master';

const { check, store } = cacheInterceptor({
  ttl: 3600,
  cacheKey: (req) => cacheKeyFromUrl(req, true),
  shouldCache: (req, res) =>
    req.method === 'GET' && res.status === 200
});

app.addInterceptor(check);
app.addInterceptor(store);
```
