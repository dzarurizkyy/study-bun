# 🔥 Hono on Bun

A practical reference guide for building web servers with Hono on Bun — covering routing, context, middleware, JSX, validation, testing, and static files.

---

## 📋 Table of Contents

- [Introduction](#-introduction)
  - [What Is Hono?](#what-is-hono)
  - [Why Hono?](#why-hono)
- [Creating a Project](#-creating-a-project)
  - [Option 1: Create a New Project](#option-1-create-a-new-project)
  - [Option 2: Add to an Existing Project](#option-2-add-to-an-existing-project)
- [Bun HTTP Server](#-bun-http-server)
- [Routing](#-routing)
  - [Base Path (Sub-routing)](#base-path-sub-routing)
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
- [Static Files](#-static-files)
- [Quick Reference](#-quick-reference)
- [Best Practices](#-best-practices)
  - [Structure by Domain](#structure-by-domain)
  - [Example: Separate App Instances](#example-separate-app-instances)

---

## 🔥 Introduction

### What Is Hono?

Hono is a **lightweight web framework** that can be used to simplify building web servers on Bun. It is an alternative to ExpressJS with superior performance and is built on **Web Standards** — meaning you can use familiar classes like `Request`, `Response`, `URL`, and more directly.

> Reference: [hono.dev](https://hono.dev/)

### Why Hono?

- Currently the **most popular web framework** in the Bun ecosystem
- Built on **standard JavaScript library** APIs, making development intuitive
- **Significantly faster** than ExpressJS in benchmarks
- Web Standard-based — no vendor lock-in, familiar API surface

> **Key Insight:** Hono is built directly on **Web Standard** APIs (`Request`, `Response`, `URL`, …) — the same classes the [Bun HTTP Server](#-bun-http-server) itself uses. That's why a Hono app is portable across Bun, Deno, Cloudflare Workers, and Node — nothing here is Bun-specific except *how* you run it.

---

## 📦 Creating a Project

There are two ways to get started with Hono:

### Option 1: Create a New Project

```bash
bun create hono study-bun-hono
```

```text
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

### Option 2: Add to an Existing Project

```bash
bun add hono
```

> Reference: [hono.dev/docs/getting-started/bun](https://hono.dev/docs/getting-started/bun)

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

**`src/index.ts`** — basic app structure:

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
```

> **Note:** `export default app` is what makes this run with a plain `bun run` — Bun's runtime looks for a default export shaped like `{ fetch }`, and a Hono app already matches that shape, so no explicit `Bun.serve()` call is needed.

---

## 🗺️ Routing

Hono provides HTTP method-named functions — `get`, `post`, `put`, `delete`, etc. — for defining routes. Routes can also use path parameters and regex constraints.

> Reference: [hono.dev/docs/api/routing](https://hono.dev/docs/api/routing)

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

> **Tip:** Routes are matched in registration order, and a constraint like `:id{[0-9]+}` only matches when it holds — a non-numeric `:id` simply falls through to the next matching route instead of erroring.

### Base Path (Sub-routing)

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

> Reference: [hono.dev/docs/api/context](https://hono.dev/docs/api/context)

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

> **Note:** `c.header(...)` and `c.status(...)` only queue values — nothing is actually sent until a body helper (`c.text()`, `c.json()`, `c.body()`, …) returns, which is why they can be called in any order beforehand.

---

## 📨 Request

The `c.req` property is a representation of the incoming HTTP request, providing access to path params, query strings, JSON bodies, headers, and more.

> Reference: [hono.dev/docs/api/request](https://hono.dev/docs/api/request)

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

> **Gotcha:** `c.req.json()` throws if the body isn't valid JSON or the `Content-Type` header isn't `application/json` — don't assume every POST body parses cleanly; see [Validation](#-validation) for a declarative way to guard against this.

---

## 📤 Response

`Context` provides multiple helper methods for constructing HTTP responses.

> References:
>
> - [hono.dev/docs/api/context](https://hono.dev/docs/api/context)
> - [developer.mozilla.org/.../Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)

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
| --- | --- |
| `c.text(...)` | Returns a plain text response |
| `c.json(...)` | Returns a JSON response |
| `c.html(...)` | Returns an HTML response |
| `c.body(...)` | Returns a raw body response |
| `c.status(code)` | Sets the HTTP status code |
| `c.header(key, val)` | Sets a response header |

---

## ⚠️ Exception

Hono provides `HTTPException` — a special error class that automatically maps to an HTTP response.

> Reference: [hono.dev/docs/api/exception](https://hono.dev/docs/api/exception)

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

> **Note:** Throwing `HTTPException` inside a route handler is caught automatically — Hono converts it straight into the `Response` you passed in, no surrounding `try`/`catch` required.

---

## 🛡️ Error Handler

Use `app.onError` to catch any unhandled errors and transform them into appropriate HTTP responses.

> Reference: [hono.dev/docs/api/exception#handling-httpexception](https://hono.dev/docs/api/exception#handling-httpexception)

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

```text
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "My Exception"
}
```

> **Tip:** Check `instanceof HTTPException` first inside `onError` — it already carries the right status and body via `getResponse()`; only your own error types need custom handling below it.

---

## 🔗 Middleware

Middleware in Hono works just like a regular route handler, with an extra `next` parameter. Call `await next()` to pass the request down the chain.

> Reference: [hono.dev/docs/guides/middleware](https://hono.dev/docs/guides/middleware)

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

> **Gotcha:** A middleware must call `await next()` to continue down the chain — skip it, and the request never reaches the route handler at all.

---

## 🧩 Built-in Middleware

Hono ships with a rich set of built-in middleware ready to use out of the box.

> Reference: [hono.dev/docs/middleware/builtin/basic-auth](https://hono.dev/docs/middleware/builtin/basic-auth)

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
| --- | --- | --- |
| Basic Auth | `hono/basic-auth` | HTTP Basic Authentication |
| Request ID | `hono/request-id` | Attaches a unique ID to each request |
| Logger | `hono/logger` | Logs incoming requests |
| Compress | `hono/compress` | Response compression |
| CORS | `hono/cors` | Cross-origin resource sharing headers |

> **Tip:** Middleware registered with `.use()` only applies to routes defined **after** it on that instance — that's why `basicAuth` and `requestId` are registered before the `/a`, `/b`, `/c` routes above.

---

## 🛠️ Helper

Hono provides utility helper functions to simplify common web tasks like cookie handling.

> Reference: [hono.dev/docs/guides/helpers](https://hono.dev/docs/guides/helpers)

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

> **Note:** `getCookie` returns `string | undefined` — reading a cookie that was never set doesn't throw, so guard for `undefined` before using the value.

---

## 🖼️ JSX

Hono supports JSX (JavaScript XML), allowing you to write HTML markup directly inside TypeScript. Use the `.tsx` file extension.

> References:
>
> - [legacy.reactjs.org/docs/introducing-jsx.html](https://legacy.reactjs.org/docs/introducing-jsx.html)
> - [hono.dev/docs/guides/jsx](https://hono.dev/docs/guides/jsx)

**`src/web.tsx`**

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

**`src/index.ts`**

```typescript
import { web } from "./web";
app.route("/", web);
```

> **Note:** JSX needs `"jsx": "react-jsx"` (or Hono's own JSX import source) configured in `tsconfig.json` — without it, `.tsx` files won't compile even though Bun strips types from plain `.ts` automatically.

---

## 🧪 Testing

Hono integrates seamlessly with Bun's built-in test runner. Use `app.request()` to simulate HTTP requests without spinning up a server.

> Reference: [hono.dev/docs/guides/testing](https://hono.dev/docs/guides/testing)

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

```bash
bun test test/index.test.ts
```

```text
bun test v1.3.12 (700fc117)

test/index.test.ts:
✓ Application > GET /hello/:name [6.16ms]

 1 pass
 0 fail
 1 expect() calls
Ran 1 test across 1 file. [72.00ms]
```

> **Key Insight:** `app.request()` calls the app in-process — no port is bound and no real network round-trip happens, which is why a test like this runs in single-digit milliseconds.

---

## ✅ Validation

Hono supports manual validation and integration with external libraries. Using **Zod** via `@hono/zod-validator` is strongly recommended over manual validation.

> Reference: [hono.dev/docs/guides/validation](https://hono.dev/docs/guides/validation)

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

> **Note:** `zValidator` short-circuits with an automatic `400` response when the schema fails — the handler only ever runs once the body already matches the schema, so it doesn't need to re-check anything itself.

---

## 📁 Static Files

Hono provides built-in support for serving static files (images, HTML, CSS, JS, etc.) without defining a route for each file.

> Reference: [hono.dev/docs/getting-started/bun#serve-static-files](https://hono.dev/docs/getting-started/bun#serve-static-files)

```typescript
import { serveStatic } from "hono/bun";

app.use("/public/*", serveStatic({ root: "./" }));
```

This serves all files under the `./public/` directory at the `/public/*` path.

> **Tip:** The `/public/*` wildcard is required — `serveStatic` matches against the path Hono routes on, not the filesystem, so omitting the `*` serves nothing.

---

## 🎯 Quick Reference

| Concept | Purpose | Key Syntax |
| --- | --- | --- |
| **Route** | Define an HTTP method + path handler | `app.get("/path", (c) => ...)` |
| **Path Param** | Read a dynamic route segment | `c.req.param("name")` |
| **Query String** | Read a `?key=value` parameter | `c.req.query("page")` |
| **JSON Body** | Read a parsed request body | `await c.req.json()` |
| **Text Response** | Plain text response | `c.text("Hello")` |
| **JSON Response** | JSON response | `c.json({ ... })` |
| **HTML Response** | Raw HTML response | `c.html("<h1>Hi</h1>")` |
| **Status / Header** | Set response status or header | `c.status(201)` / `c.header(key, val)` |
| **Sub-routing** | Mount routes under a base path | `new Hono().basePath("/api")` |
| **Exception** | Throw a status-carrying error | `throw new HTTPException(400)` |
| **Error Handler** | Catch every unhandled error | `app.onError((err, c) => ...)` |
| **Middleware** | Run logic before a route handler | `app.use(async (c, next) => ...)` |
| **Basic Auth** | Built-in HTTP auth middleware | `basicAuth({ username, password })` |
| **Cookies** | Read/write a cookie | `getCookie(c, name)` / `setCookie(c, name, value)` |
| **JSX** | Return HTML built from JSX | `c.html(<div>...</div>)` |
| **Testing** | Call the app without a real server | `await app.request("/path")` |
| **Validation** | Validate a request body with Zod | `zValidator("json", schema)` |
| **Static Files** | Serve a directory as-is | `serveStatic({ root: "./" })` |

---

## 💡 Best Practices

A common pattern in other frameworks is grouping every route into a single controller. In Hono, this is **not recommended** due to the complexity of TypeScript generics. Instead, create separate `Hono` app instances per domain.

> Reference: [hono.dev/docs/guides/best-practices](https://hono.dev/docs/guides/best-practices)

### Structure by Domain

```text
src/
├── index.ts        ← Main app, mounts all sub-apps
├── operation.ts    ← Operation routes
├── web.tsx         ← Web/JSX routes
└── book.ts         ← Book routes
```

### Example: Separate App Instances

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

**✅ Do This**

- **Create one `Hono` instance per domain** and mount it with `app.route()`, rather than one grouped controller
- **Export the app as `export default app`** so Bun's runtime picks it up directly — no explicit `Bun.serve()` call needed
- **Reach for `@hono/zod-validator`** instead of validating request bodies by hand
- **Register auth and identity middleware before the routes that need them** — middleware only affects routes registered after it on that instance
- **Throw `HTTPException`** for expected error responses, and keep a single `app.onError` to normalize everything else
- **Use `app.request()` in tests** to exercise routes in-process, with no real network call
- **Serve static assets with `serveStatic`** instead of hand-writing a route per file

**❌ Avoid This**

- **Grouping every route into one giant controller** — Hono's generics make that unwieldy fast; split by domain instead
- **Forgetting to call `next()`** inside a middleware — the request never reaches the route handler
- **Throwing a plain `Error`** where callers expect a specific status code — throw `HTTPException` instead so the status is meaningful
- **Skipping `app.onError`** — an uncaught non-`HTTPException` error then surfaces as an unhandled exception instead of a clean response
- **Validating manually** when `@hono/zod-validator` already does it declaratively with an automatic `400` on failure

> Reference: [hono.dev/docs](https://hono.dev/docs) · [hono.dev/docs/guides/best-practices](https://hono.dev/docs/guides/best-practices) · [hono.dev/docs/guides/testing](https://hono.dev/docs/guides/testing)
