# ⚡ Bun Hono – Complete Guide
A comprehensive guide for building web servers with Hono on Bun — a fast, lightweight, and standards-based web framework.

---

## 📋 Table of Contents

- [What is Hono?](#-what-is-hono)
- [Why Hono?](#-why-hono)
- [Creating a Project](#-creating-a-project)
- [Bun HTTP Server](#-bun-http-server)
- [Routing](#-routing)
- [Context](#-context)
- [Request](#-request)
- [Response](#-response)
- [Exception](#-exception)
- [Error Handler](#-error-handler)
- [Middleware](#-middleware)
- [Built-in Middleware](#-built-in-middleware)
- [Helper](#-helper)
- [JSX](#-jsx)
- [Testing](#-testing)
- [Validation](#-validation)
- [Best Practices](#-best-practices)
- [Static Files](#-static-files)

---

## 🔥 What is Hono?

Hono is a **lightweight web framework** that can be used to simplify building web servers on Bun. It is an alternative to ExpressJS with superior performance and is built on **Web Standards** — meaning you can use familiar classes like `Request`, `Response`, `URL`, and more directly.

> Official docs: [https://hono.dev/](https://hono.dev/)

---

## 💡 Why Hono?

- Currently the **most popular web framework** in the Bun ecosystem
- Built on **standard JavaScript library** APIs, making development intuitive
- **Significantly faster** than ExpressJS in benchmarks
- Web Standard-based — no vendor lock-in, familiar API surface

---

## 📦 Creating a Project

There are two ways to get started with Hono:

- #### Option 1 — Create a new project

  ```bash
  bun create hono study-bun-hono
  ```

  ```
  create-hono version 0.19.4
  ✔ Using target directory … study-bun-hono
  ✔ Which template do you want to use? bun
  ✔ Do you want to install project dependencies? Yes
  ✔ Which package manager do you want to use? bun
  ✔ Cloning the template
  ✔ Installing project dependencies
  🎉 Copied project files
  Get started with: cd study-bun-hono
  ```

- #### Option 2 — Add to an existing Bun project

  ```bash
  bun add hono
  ```

> Reference: [https://hono.dev/docs/getting-started/bun](https://hono.dev/docs/getting-started/bun)

---

## 🚀 Bun HTTP Server

Hono is fully compatible with the Bun HTTP Server. To start the server:

```bash
bun run src/index.ts
```

Or use the `dev` script (with hot reload):

```bash
bun run dev
# $ bun run --hot src/index.ts
# Started development server: http://localhost:3000
```

`src/index.ts` — Basic app structure:

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
```

---

## 🗺️ Routing

Hono provides HTTP method-named functions — `get`, `post`, `put`, `delete`, etc. — for defining routes. Routes can also use path parameters and regex constraints.

> Reference: [https://hono.dev/docs/api/routing](https://hono.dev/docs/api/routing)

```typescript
import { Hono } from "hono";

const app = new Hono();

app
  .get("/hello/:name", (c) => {
    const name = c.req.param("name");
    return c.text(`Hello ${name}`);
  })
  .post("/hello", (c) => {
    return c.text("Hello POST!");
  })
  .get("/products/:id{[0-9]+}", async (c) => {
    const id = c.req.param("id");
    return c.text(`Product ${id}`);
  })
  .get("/", (c) => {
    return c.text("Hello World!");
  });
```

- #### Base Path (Sub-routing)

  ```typescript
  const book = new Hono().basePath("/api");

  book.get("/book", (c) => c.text("Book"));
  book.get("/book/a", (c) => c.text("Book A"));
  book.get("/book/:id", (c) => c.text("Book Id"));

  app.route("/", book);
  ```

---

## 🔧 Context

Every route handler receives a `Context` object (`c`) that provides access to both the request and response utilities.

> Reference: [https://hono.dev/docs/api/context](https://hono.dev/docs/api/context)

```typescript
// Manual response with headers and status
app.get("/context", async (c) => {
  c.header("Content-Type", "application/json");
  c.status(200);
  return c.body(JSON.stringify({ first_name: "Dzaru", last_name: "Rizky" }));
});

// Shorthand JSON response
app.get("/context.json", async (c) => {
  return c.json({ first_name: "Dzaru", last_name: "Rizky" });
});
```

---

## 📨 Request

The `c.req` property is a representation of the incoming HTTP request, providing access to path params, query strings, JSON bodies, headers, and more.

> Reference: [https://hono.dev/docs/api/request](https://hono.dev/docs/api/request)

```typescript
// Read JSON body
app.post("/users", async (c) => {
  const json = await c.req.json();
  return c.json({ hello: `Hi, ${json.name}!` });
});

// Read query string parameters
app.get("/users", async (c) => {
  const page = c.req.query("page");
  const size = c.req.query("size");
  return c.text(`Users with page ${page} and size ${size}`);
});
```

---

## 📤 Response

`Context` provides multiple helper methods for constructing HTTP responses.

> References:
> - [https://hono.dev/docs/api/context](https://hono.dev/docs/api/context)
> - [https://developer.mozilla.org/en-US/docs/Web/API/Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

```typescript
// Plain text response
app.get("/response/text", (c) => c.text("Hello Hono"));

// JSON response
app.get("/response/json", (c) => c.json({ data: "Hello Hono" }));

// HTML response
app.get("/response/html", (c) =>
  c.html("<html><body><h1>Hello Hono</h1></body></html>")
);

// JSON with custom status and headers
app.get("/response/json", (c) => {
  c.status(201);
  c.header("X-Author", "Dzaru Rizky Fathan Fortuna");
  return c.json({ data: "Hello Hono" });
});
```

| Method | Description |
|--------|-------------|
| `c.text(...)` | Returns a plain text response |
| `c.json(...)` | Returns a JSON response |
| `c.html(...)` | Returns an HTML response |
| `c.body(...)` | Returns a raw body response |
| `c.status(code)` | Sets the HTTP status code |
| `c.header(key, val)` | Sets a response header |

---

## ⚠️ Exception

Hono provides `HTTPException` — a special error class that automatically maps to an HTTP response.

> Reference: [https://hono.dev/docs/api/exception](https://hono.dev/docs/api/exception)

```typescript
import { HTTPException } from "hono/http-exception";

app.get("/say-hello", async (c) => {
  const name = c.req.query("name");

  if (!name) {
    throw new HTTPException(400, {
      res: new Response(
        JSON.stringify({ error: "Name param must not empty" }),
        {
          status: 400,
          headers: {
            Author: "Dzaru Rizky Fathan Fortuna",
            "Content-Type": "application/json",
          },
        }
      ),
    });
  }

  return c.text(`Hello ${name}`);
});
```

---

## 🛡️ Error Handler

Use `app.onError` to catch any unhandled errors and transform them into appropriate HTTP responses.

> Reference: [https://hono.dev/docs/api/exception#handling-httpexception](https://hono.dev/docs/api/exception#handling-httpexception)

```typescript
class MyException extends Error {}

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  } else if (err instanceof MyException) {
    c.status(500);
    return c.json({ error: "My Exception" });
  } else {
    c.status(500);
    return c.json({ error: "Internal Server Error" });
  }
});

app.get("/ups", (c) => {
  throw new MyException();
});
```

`Expected response:`

```
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "My Exception"
}
```

---

## 🔗 Middleware

Middleware in Hono works just like a regular route handler, with an extra `next` parameter. Call `await next()` to pass the request down the chain.

> Reference: [https://hono.dev/docs/guides/middleware](https://hono.dev/docs/guides/middleware)

```typescript
const admin = new Hono();

admin.use(async (c, next) => {
  const token = c.req.header("Authorization");

  if (!token) {
    throw new HTTPException(401);
  }

  await next();
});

admin.get("/a", (c) => c.text("Admin A"));
admin.get("/b", (c) => c.text("Admin B"));
admin.get("/c", (c) => c.text("Admin C"));

app.route("/admin", admin);
```

---

## 🧩 Built-in Middleware

Hono ships with a rich set of built-in middleware ready to use out of the box.

> Reference: [https://hono.dev/docs/middleware/builtin/basic-auth](https://hono.dev/docs/middleware/builtin/basic-auth)

```typescript
import { basicAuth } from "hono/basic-auth";
import { requestId } from "hono/request-id";

const operation = new Hono().basePath("/operation");

operation.use(basicAuth({ username: "admin", password: "admin" }));
operation.use(requestId());

operation.get("/a", (c) => c.text(`operation A: ${c.get("requestId")}`));
operation.get("/b", (c) => c.text(`operation B: ${c.get("requestId")}`));
operation.get("/c", (c) => c.text(`operation C: ${c.get("requestId")}`));

app.route("/", operation);
```

| Middleware | Import Path | Description |
|------------|-------------|-------------|
| Basic Auth | `hono/basic-auth` | HTTP Basic Authentication |
| Request ID | `hono/request-id` | Attaches a unique ID to each request |
| Logger | `hono/logger` | Logs incoming requests |
| Compress | `hono/compress` | Response compression |
| CORS | `hono/cors` | Cross-origin resource sharing headers |

---

## 🛠️ Helper

Hono provides utility helper functions to simplify common web tasks like cookie handling.

> Reference: [https://hono.dev/docs/guides/helpers](https://hono.dev/docs/guides/helpers)

```typescript
import { setCookie, getCookie } from "hono/cookie";

// Set a cookie
app.get("/cookie/set", (c) => {
  const value = c.req.query("value") as string;
  setCookie(c, "Hono-Cookie", value, { path: "/" });
  return c.text(`Success set cookie ${value}`);
});

// Get a cookie
app.get("/cookie/get", (c) => {
  const cookie = getCookie(c, "Hono-Cookie");
  return c.text(`Cookie value: ${cookie}`);
});
```

---

## 🖼️ JSX

Hono supports JSX (JavaScript XML), allowing you to write HTML markup directly inside TypeScript. Use the `.tsx` file extension for TypeScript.

> References:
> - [https://legacy.reactjs.org/docs/introducing-jsx.html](https://legacy.reactjs.org/docs/introducing-jsx.html)
> - [https://hono.dev/docs/guides/jsx](https://hono.dev/docs/guides/jsx)

`src/web.tsx`

```tsx
import { Hono } from "hono";

export const web = new Hono().basePath("/web");

web.get("/a", (c) => {
  const html = (
    <html>
      <head>
        <title>This is HTML code</title>
      </head>
      <body>
        <h1>This is title</h1>
      </body>
    </html>
  );

  return c.html(html);
});
```

`src/index.ts`

```typescript
import { web } from "./web";
app.route("/", web);
```

---

## 🧪 Testing

Hono integrates seamlessly with Bun's built-in test runner. Use `app.request()` to simulate HTTP requests without spinning up a server.

> Reference: [https://hono.dev/docs/guides/testing](https://hono.dev/docs/guides/testing)

```typescript
import { describe, it, expect } from "bun:test";
import app from "../src/index";

describe("Application", () => {
  it("GET /hello/:name", async () => {
    const response = await app.request("/hello/dzaru");
    const text = await response.text();

    expect(text).toBe("Hello dzaru");
  });
});
```

`Run tests:`

```bash
bun test test/index.test.ts
```

`Output:`

```
bun test v1.3.12 (700fc117)

test/index.test.ts:
✓ Application > GET /hello/:name [6.16ms]

 1 pass
 0 fail
 1 expect() calls
Ran 1 test across 1 file. [72.00ms]
```

---

## ✅ Validation

Hono supports manual validation and integration with external libraries. Using **Zod** via `@hono/zod-validator` is strongly recommended over manual validation.

> Reference: [https://hono.dev/docs/guides/validation](https://hono.dev/docs/guides/validation)

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

app.post(
  "/login",
  zValidator(
    "json",
    z.object({
      username: z.string().min(3).max(10),
      password: z.string().min(3).max(10),
    })
  ),
  async (c) => {
    const body = await c.req.json();
    return c.json({ data: `Hello ${body.username}` });
  }
);
```

---

## 🏗️ Best Practices

A common pattern in other frameworks is grouping routes into a single controller. In Hono, this is **not recommended** due to the complexity of TypeScript generics. Instead, create separate `Hono` app instances per domain.

> Reference: [https://hono.dev/docs/guides/best-practices](https://hono.dev/docs/guides/best-practices)

- #### Structure by Domain

  ```
  src/
  ├── index.ts        ← Main app, mounts all sub-apps
  ├── operation.ts    ← Operation routes
  ├── web.tsx         ← Web/JSX routes
  └── book.ts         ← Book routes
  ```

- #### Example: Separate App Instances

  ```typescript
  // src/operation.ts
  import { Hono } from "hono";
  import { basicAuth } from "hono/basic-auth";
  import { requestId } from "hono/request-id";

  export const operation = new Hono().basePath("/operation");

  operation.use(basicAuth({ username: "admin", password: "admin" }));
  operation.use(requestId());

  operation.get("/a", (c) => c.text(`operation A: ${c.get("requestId")}`));
  operation.get("/b", (c) => c.text(`operation B: ${c.get("requestId")}`));
  operation.get("/c", (c) => c.text(`operation C: ${c.get("requestId")}`));
  ```

  ```typescript
  // src/index.ts
  import { operation } from "./operation";
  app.route("/", operation);
  ```

---

## 📁 Static Files

Hono provides built-in support for serving static files (images, HTML, CSS, JS, etc.) without defining a route for each file.

> Reference: [https://hono.dev/docs/getting-started/bun#serve-static-files](https://hono.dev/docs/getting-started/bun#serve-static-files)

```typescript
import { serveStatic } from "hono/bun";

app.use("/public/*", serveStatic({ root: "./" }));
```

This serves all files under the `./public/` directory at the `/public/*` path.

---

## 📊 Summary

| Feature | Description |
|---------|-------------|
| **Routing** | HTTP method-based routing with path params and regex support |
| **Context** | Unified `c` object for request + response management |
| **Middleware** | Chainable handlers with `next()` for cross-cutting concerns |
| **Built-in Middleware** | Auth, request IDs, logging, CORS, compression, and more |
| **JSX** | Write HTML templates directly in TypeScript with `.tsx` |
| **Validation** | Schema validation via Zod integration |
| **Testing** | Native Bun test runner with `app.request()` for in-process testing |
| **Static Files** | Serve entire directories with a single middleware line |
