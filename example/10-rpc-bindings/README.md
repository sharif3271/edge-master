# RPC Service Bindings Example

Inter-worker communication with type-safe RPC (2025 feature).

## Features
- Service-to-service communication
- Type-safe RPC calls
- WorkerEntrypoint pattern
- Service composition
- Zero-latency local calls

## Service Worker
```typescript
import { WorkerEntrypoint } from 'cloudflare:workers';

export class UserService extends WorkerEntrypoint {
  async getUser(id: string) {
    return { id, name: 'John Doe' };
  }

  async listUsers() {
    return [{ id: '1', name: 'User 1' }];
  }
}
```

## Gateway Worker
```typescript
app.GET('/users/:id', new RouteHandler(new Task({
  do: async ({ req, reqCtx }) => {
    const id = extractId(req);

    // Call UserService via RPC
    const user = await reqCtx.env.USER_SERVICE.getUser(id);

    return json({ user });
  }
})));
```

## Wrangler Configuration
```toml
[[services]]
binding = "USER_SERVICE"
service = "user-service"
```

## Benefits
- Type safety across services
- Zero network latency (same thread)
- Clean service boundaries
- Easy testing and mocking

*Full implementation coming soon. See `example/README.md` for patterns.*
