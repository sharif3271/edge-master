# Workers KV Integration Example

Persistent storage with Cloudflare Workers KV.

## Features
- Session management
- Feature flags
- Configuration storage
- User preferences
- Distributed caching with KV

## Wrangler Configuration
```toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

## Example Usage
```typescript
app.POST('/session', new RouteHandler(new Task({
  do: async ({ req, reqCtx }) => {
    const { userId, data } = await parseJSON(req);
    const sessionId = crypto.randomUUID();

    await reqCtx.env.KV.put(
      `session:${sessionId}`,
      JSON.stringify(data),
      { expirationTtl: 86400 } // 24 hours
    );

    return json({ sessionId });
  }
})));
```

*Full implementation coming soon. See `example/README.md` for patterns.*
