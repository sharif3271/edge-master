# Image Optimization Example

On-the-fly image transformation and optimization.

## Features
- Resize and crop
- Format conversion (WebP, AVIF)
- Quality optimization
- Cloudflare Images integration
- Caching for transformed images

## Example
```typescript
app.GET('/images/*', new RouteHandler(new Task({
  do: async ({ req }) => {
    const url = new URL(req.url);
    const width = getQuery(req, 'width');
    const format = getQuery(req, 'format') || 'auto';

    // Transform image using Cloudflare Images
    return fetch(`https://imagedelivery.net/...`);
  }
})));
```

*Full implementation coming soon. See `example/README.md` for patterns.*
