# Microservices Proxy Example

API gateway pattern for routing requests to multiple backend services.

## Features
- Service routing by path prefix
- Request/response transformation
- Load balancing across services
- Circuit breaker for failing services
- Service health checks

## Example Structure
```typescript
app.group('/service-a', (group) => {
  group.addRoute(() => true, proxyToServiceA);
});

app.group('/service-b', (group) => {
  group.addRoute(() => true, proxyToServiceB);
});
```

## Learn
- Request proxying
- Service orchestration
- Error handling patterns
- Retry logic

*Full implementation coming soon. See `example/README.md` for patterns.*
