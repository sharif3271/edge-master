<p align="center">
  <a href="https://em.asanflow.com/">
    <img width="450px" src="https://pstorage.asanflow.com/micro-worker/logo-text.svg" alt="EdgeMaster Logo" />
  </a>
</p>

---

<p align="center">
  <a href="https://www.npmjs.com/package/edge-master" target="_blank">
    <img src="https://img.shields.io/npm/v/edge-master.svg?style=flat-square" alt="npm version" />
  </a>
  <a href="https://deno.bundlejs.com/?q=edge-master" target="_blank">
    <img src="https://deno.bundlejs.com/?q=edge-master&badge&badge-style=flat-square" alt="bundle size" />
  </a>
  <a href="https://github.com/sharif3271/edge-master/actions/workflows/tests.yml" target="_blank">
    <img src="https://img.shields.io/github/actions/workflow/status/sharif3271/edge-master/tests.yml?branch=main&style=flat-square" alt="build status" />
  </a>
  <a href="https://coveralls.io/github/sharif3271/edge-master" target="_blank">
    <img src="https://img.shields.io/coveralls/github/sharif3271/edge-master/main?style=flat-square" alt="code coverage" />
  </a>
  <a href="https://www.npmjs.com/package/edge-master" target="_blank">
    <img src="https://img.shields.io/npm/dw/edge-master?style=flat-square" alt="weekly downloads" />
  </a>
  <a href="https://github.com/sharif3271/edge-master/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/sharif3271/edge-master?style=flat-square" alt="open issues" />
  </a>
  <a href="" target="_blank">
    <img src="" alt="" />
  </a>
</p>

<a href="https://em.asanflow.com/" target="_blank">EdgeMaster</a> is a flexible microframework designed to handle routing and intercept requests/responses in cloud based environments such, as Cloudflare Workers or serverless functions. It offers a robust set of tools that can greatly simplify the development of your edge applications.

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
- **Interception Support**: Implement interceptors for Request/Response effortlessly, whether built-in or custom.
- **Platform-Agnostic**: Functions seamlessly in diverse cloud-based environments such as Cloudflare Workers and serverless platforms, while providing full compatibility with the Fetch API.
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
  EdgeController,
  RouteHandler,
  Task,
  routePattern,
  initResponse
} from 'edge-master';

// Cloudflare Worker
export default {
  async fetch(req) {
    return EdgeApp.handleRequest({ req });
  },
}

const EdgeApp = new EdgeController();

EdgeApp.addRoute(
  routePattern('*/users/profile/*'),
  new RouteHandler().registerTask(new Task({
    do: async ({ req }) => {
      const tempRes = await fetch(req);
      // some transform on response
      return new Response(tempRes.body, {
        ...tempRes,
        headers: {
          ...tempRes.headers,
          'My-Res-Status': 'transformed'
        }
      });
    }
  }))
);

EdgeApp.addRoute(
  routePattern('*'),
  new RouteHandler().registerTask(initResponse())
);


```

---

## Routing

EdgeMaster streamlines routing in your application with built-in route matchers, and we're continually adding more. If your project requires custom, intricate route matching, you can easily implement it with the flexibility our framework offers. At EdgeMaster, we aim to make complex route matching straightforward and accessible for developers.

```javascript
import {
  EdgeController,
  routePattern, // You can use wildcards and optional segments to create flexible route patterns.
  pathStartWith,
  urlStartWith,
} from 'edge-master';

const App = new EdgeController();

App.addRoute(routePattern('*/user/*/info'), {/** RouteHandler of UserInfo  */});

App.addRoute(pathStartWith('/api/v2/user'), {/** RouteHandler of User  */});

App.addRoute(urlStartWith('https://origin.com/api/v2/user'), {/** RouteHandler of User  */});

// This handler will be executed when none of the other registered routes don't match the request.
App.addRoute(() => true, {/** RouteHandler of Default or Non-matching routes */});

```

### Custom Route Matcher

EdgeMaster allows you to define your own route matcher.

```javascript

type Matcher = (req: Request) => boolean;

const onlyGetMethod = (matcher: Matcher): Matcher => {
  return (req) => (req.method === "GET" && matcher(req))
}

App.addRoute(
  onlyGetMethod(routePattern('*/some/*/wildcard')),
  {/** RouteHandler */ }
);

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
    const { reqCtx: { req }, responder } = context;
    if (/** req is ok*/)
      return req;
    else
      // responder will break all next steps and respond instnatly the request.
      responder(new Response('Not Authenticated', { status: 401 }))
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

Check out more examples and use cases in the [EdgeMaster Examples](https://github.com/sharif3271/edge-master/tree/main/example).

---

## Contributing

We welcome contributions from the community to make EdgeMaster even better.
If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Install dependencies `npm install`.
3. Start the test runner `npm run test`.
4. Add your code and tests.
5. Commit your changes && Submit a pull request.

We'll review your contribution and, if

 everything looks good, merge it into the main codebase.

---

## Credits

EdgeMaster is developed and maintained by [Sharif Eiri](https://github.com/sharif3271/). It's inspired by the simplicity of microframeworks like Express.js and is built to be highly compatible with cloud-based serverless environments. Special thanks to the open-source community for their contributions and support.

---

Thank you for choosing EdgeMaster for your edge application development! If you have any questions or encounter issues, please don't hesitate to reach out on our [GitHub repository](https://github.com/sharif3271/edge-master).

Happy coding! 🚀

---
