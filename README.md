# Study Bun ⚡

This repository contains a comprehensive reference guide for Bun — covering the runtime and its built-in toolchain, the Hono web framework, and a complete RESTful API built end-to-end with Hono, Prisma, and MariaDB.

## Installation 🔧

1. **Install Bun**:
   - Run the official install script:

     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```

   - Verify the installation:

     ```bash
     bun --version
     ```

   > Reference: [bun.sh/docs/installation](https://bun.sh/docs/installation)

2. **Clone the Repository**:

   ```bash
   git clone https://github.com/dzarurizkyy/study-bun.git
   cd study-bun
   ```

3. **Install Docker** (only needed for [Chapter 3](003-bun-restful-api.md)):
   - The RESTful API chapter runs its database in a local **MariaDB** container — install [Docker](https://www.docker.com/) beforehand if you want to follow along with that chapter

4. **Follow Along Per Chapter**:
   - Each chapter scaffolds its own project folder, with the setup commands (`bun init`, `bun create hono`, dependency installs) written into that chapter as its own step
   - Start with [Bun Basics](001-bun-basics.md) — every later chapter builds on the same runtime

## List of Material 📚

- ⚡ **[Bun Basics](001-bun-basics.md)**

  Runtime setup, the built-in package manager, the Jest-compatible test runner, workspaces, and compiling standalone executables — plus Bun's own standard library, exposed through the global `Bun` object:

  ```typescript
  Bun.serve({
    port: 3000,
    fetch: (request) => {
      const url = new URL(request.url);
      const name = url.searchParams.get("name") || "World";
      return new Response(`Hello ${name}`);
    },
  });
  ```

- 🔥 **[Hono on Bun](002-bun-hono.md)**

  Building web servers with Hono on Bun — routing, context, middleware, JSX, validation, testing, and static files:

  ```typescript
  import { Hono } from "hono";

  const app = new Hono();

  app
    .get("/hello/:name", (c) => {
      const name = c.req.param("name");
      return c.text(`Hello ${name}`);
    })
    .get("/products/:id{[0-9]+}", async (c) => {
      const id = c.req.param("id");
      return c.text(`Product ${id}`);
    });
  ```

- 🚀 **[Hono RESTful API — Contact Management](003-bun-restful-api.md)**

  A full RESTful API built stage by stage across three modules — User → Contact → Address — using Hono, Prisma (MariaDB), Zod, and Winston:

  ```typescript
  export const authMiddleware: MiddlewareHandler = async (c, next) => {
    const token = c.req.header("Authorization");

    const user = await UserService.get(token);

    c.set("user", user);
    await next();
  };
  ```

## 📍 References

- [Bun Docs](https://bun.sh/docs)
- [Hono Docs](https://hono.dev/docs)

## 👨‍💻 Contributors

- [Dzaru Rizky Fathan Fortuna](https://www.linkedin.com/in/dzarurizky)
