# A/B Testing Example

Feature flags and A/B testing with traffic splitting.

## Features
- Traffic splitting (50/50, 80/20, etc.)
- Cookie-based variant assignment
- Feature flags
- Analytics integration
- Progressive rollout

## Quick Example
```typescript
app.GET('/feature', new RouteHandler(new Task({
  do: async (ctx) => {
    const variant = getVariant(ctx.req); // 'A' or 'B'

    if (variant === 'B') {
      return json({ feature: 'new' });
    }

    return json({ feature: 'old' });
  }
})));
```

*Full implementation coming soon. See `example/README.md` for patterns.*
