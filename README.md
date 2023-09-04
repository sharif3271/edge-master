# EdgeMaster

EdgeMaster is a minimalistic and versatile microframework for handling routing and request/response interception in cloud-based environments like Cloudflare Workers or serverless functions. It provides a lightweight yet powerful toolset to streamline your edge application development.

<p align="center">
  <a href="https://yourappurl.com">
    <img src="https://pstorage.asanflow.com/micro-worker/logo-text.svg" alt="EdgeMaster Logo" />
  </a>
</p>

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Routing](#routing)
- [Interceptors](#interceptors)
- [Examples](#examples)
- [Contributing](#contributing)
- [Credits](#credits)

---

## Features

- **Lightweight**: EdgeMaster is incredibly small in size, allowing you to keep your application's footprint minimal.
- **Fully-Typed**: Enjoy the benefits of TypeScript with complete type definitions.
- **Simplified Routing**: Create concise and expressive routes with ease.
- **Middleware Support**: Implement middleware functions effortlessly, whether built-in or custom.
- **Platform-Agnostic**: Works seamlessly across various cloud-based environments, including Cloudflare Workers and serverless platforms.
- **Route Parameter Parsing**: Easily extract parameters, query strings, and more from your routes.
- **Error Handling**: Gracefully handle errors and define error responses.

---

## Installation

To get started with EdgeMaster, you can install it via npm:

```bash
npm install edge-master
```

---

## Getting Started

Here's a simple example of setting up EdgeMaster in a Cloudflare Worker module:

```javascript
import {
  error,      // Creates error responses
  json,       // Creates JSON responses
  Router,     // The microframework router
  withParams, // Middleware: puts parameters directly on the Request
} from 'edge-master';

import { todos } from './external/todos';

// Create a new Router instance
const router = Router();

router
  // Add some middleware upstream on all routes
  .all('*', withParams)

  // GET list of todos
  .get('/todos', () => todos)

  // GET single todo, by ID
  .get(
    '/todos/:id',
    ({ id }) => todos.getById(id) || error(404, 'That todo was not found')
  )

  // 404 for everything else
  .all('*', () => error(404));

// Export as a Cloudflare Worker module
export default {
  fetch: (request, ...args) =>
    router
      .handle(request, ...args)
      .then(json)     // Send as JSON
      .catch(error),  // Handle errors
};
```

---

## Routing

EdgeMaster simplifies routing in your application. You can create routes and handle HTTP methods with ease.

```javascript
const router = Router();

router
  .get('/path', (request) => /* Handle GET request */)
  .post('/path', (request) => /* Handle POST request */)
  .put('/path', (request) => /* Handle PUT request */)
  .delete('/path', (request) => /* Handle DELETE request */)
  .all('/path', (request) => /* Handle any method for /path */);
```

### Route Parameters

EdgeMaster allows you to define route parameters and access them in your route handlers.

```javascript
router.get('/users/:id', ({ id }) => /* Access the "id" parameter */);
```

### Wildcards and Optional Segments

You can use wildcards and optional segments to create flexible route patterns.

```javascript
router.get('/files/*', (request) => /* Match any path after /files/ */);

router.get('/page(/:section)', ({ section }) => /* Optional "section" parameter */);
```

---

## Interceptors

EdgeMaster provides a convenient way to intercept incoming requests and outgoing responses using interceptors. Interceptors can be used for tasks such as authentication, logging, and response modification.

### Request Interceptors

Request interceptors are executed before your route handlers, allowing you to modify the incoming request.

```javascript
const authenticationInterceptor = {
  type: InterceptorType.Request,
  async intercept(context) {
    // Check authentication and modify the request if needed
    const { req } = context.reqCtx;
    // ...
    return req;
  },
};

router.addInterceptor(authenticationInterceptor);
```

### Response Interceptors

Response interceptors are executed after your route handlers, enabling you to modify the response before it's sent back to the client.

```javascript
const loggingInterceptor = {
  type: InterceptorType.Response,
  async intercept(context) {
    // Log the response or make changes before sending it
    const { res } = context;
    // ...
    return res;
  },
};

router.addInterceptor(loggingInterceptor);
```

---

## Examples

Check out more examples and use cases in the [EdgeMaster Examples](https://github.com/yourusername/microworker-examples).

---

## Contributing

We welcome contributions from the community to make EdgeMaster even better. If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Install development dependencies using `npm install`.
3. Start the test runner/dev mode with `npm run dev`.
4. Add your code and tests as needed (do NOT remove/alter existing tests).
5. Commit your changes.
6. Submit a pull request, and make sure to fill out the template.

We'll review your contribution and, if

 everything looks good, merge it into the main codebase.

---

## Credits

EdgeMaster is developed and maintained by [Your Name](https://github.com/yourusername). It's inspired by the simplicity of microframeworks like Express.js and is built to be highly compatible with cloud-based serverless environments. Special thanks to the open-source community for their contributions and support.

---

Thank you for choosing EdgeMaster for your edge application development! If you have any questions or encounter issues, please don't hesitate to reach out on our [GitHub repository](https://github.com/yourusername/EdgeMaster).

Happy coding! 🚀

---

Please replace the placeholders like `<yourappurl.com>` and `<yourusername>` with the appropriate information. You can also customize this README further as needed.