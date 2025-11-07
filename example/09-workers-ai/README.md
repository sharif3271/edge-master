# Workers AI Integration Example

AI-powered features with Cloudflare Workers AI (2025).

## Features
- Text generation
- Sentiment analysis
- Content classification
- Translation services
- Text summarization

## Wrangler Configuration
```toml
[ai]
binding = "AI"
```

## Example Usage
```typescript
app.POST('/ai/summarize', new RouteHandler(new Task({
  do: async ({ req, reqCtx }) => {
    const { text } = await parseJSON(req);

    const response = await reqCtx.env.AI.run(
      '@cf/meta/llama-2-7b-chat-int8',
      {
        prompt: `Summarize this text: ${text}`
      }
    );

    return json({ summary: response.response });
  }
})));
```

## Models Available
- Text generation: `@cf/meta/llama-2-7b-chat-int8`
- Translation: `@cf/meta/m2m100-1.2b`
- Classification: `@cf/huggingface/distilbert-sst-2-int8`

*Full implementation coming soon. See `example/README.md` for patterns.*
