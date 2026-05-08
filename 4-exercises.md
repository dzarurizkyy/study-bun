# 🧪 Bun Hands-On Exercise — Task Manager API

A complete hands-on scenario that covers all core Bun concepts: installation, configuration, runtime features, built-in APIs, package management, testing, and building a RESTful API with Hono — all in one real-world use case.

---

## 📖 Scenario

You are a backend developer assigned to build a **Task Manager REST API** called **TaskFlow** — a lightweight API for managing personal tasks. You will implement:

- **Runtime Basics** — running files, TypeScript support, environment variables
- **Built-in APIs** — HTTP server, file I/O, hashing, and utilities
- **Package Management** — installing, managing, and using third-party packages
- **Test Runner** — writing unit tests with Bun's built-in Jest-compatible runner
- **Hono Web Framework** — routing, middleware, validation, error handling
- **RESTful API** — full CRUD for task management

By the end of this exercise, you will have a fully working API server with tests — covering every key Bun concept.

---

## 🗂️ Table of Contents

1. [Setup & Installation](#1-setup--installation)
2. [Running Files & TypeScript](#2-running-files--typescript)
3. [Environment Variables & Watch Mode](#3-environment-variables--watch-mode)
4. [Built-in HTTP Server](#4-built-in-http-server)
5. [File I/O & Hashing](#5-file-io--hashing)
6. [Package Manager](#6-package-manager)
7. [Test Runner](#7-test-runner)
8. [Hono Setup & Routing](#8-hono-setup--routing)
9. [Middleware & Error Handling](#9-middleware--error-handling)
10. [RESTful API — Task CRUD](#10-restful-api--task-crud)
11. [Validation with Zod](#11-validation-with-zod)
12. [Testing the API](#12-testing-the-api)
13. [Build & Executable](#13-build--executable)
14. [Challenge Tasks](#-challenge-tasks)

---

## 1. Setup & Installation

### 1a. Prerequisites

Before starting, make sure Bun is installed on your machine:

| Requirement | Version |
|-------------|---------|
| Bun | v1.0+ |
| OS | Linux, macOS, or Windows |

### 1b. Install Bun

Follow the installation guide at https://bun.sh/docs/installation

Verify your installation:

```bash
bun --version
```

Expected output:
```
1.x.xx
```

### 1c. Initialize Project

Create and scaffold a new project:

```bash
mkdir taskflow-api
cd taskflow-api
bun init
```

When prompted for the entrypoint, choose `index.ts` (TypeScript project).

> ✅ Bun will generate `index.ts`, `package.json`, `tsconfig.json`, and `bun.lockb` automatically.

### 1d. Configure package.json Scripts

Update your `package.json` to add helpful scripts:

```json
{
  "name": "taskflow-api",
  "version": "1.0.0",
  "scripts": {
    "start": "bun run src/index.ts",
    "dev": "bun run --hot src/index.ts",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "build": "bun build src/index.ts --outdir dist --minify",
    "build:exe": "bun build src/index.ts --compile --outfile build/taskflow"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```

### 1e. Project Structure

Your final folder structure should look like this:

```
taskflow-api/
├── src/
│   ├── index.ts           # Main entry point
│   ├── routes/
│   │   └── task.ts        # Task route handlers
│   ├── middleware/
│   │   └── auth.ts        # Auth middleware
│   └── types/
│       └── task.ts        # TypeScript interfaces
├── test/
│   ├── task.test.ts       # Unit tests for task logic
│   └── api.test.ts        # API integration tests
├── data/
│   └── tasks.json         # File-based data store
├── .env                   # Environment variables
├── bunfig.toml            # Bun configuration
├── tsconfig.json
└── package.json
```

---

## 2. Running Files & TypeScript

### 2a. Your First Bun File

Create `src/hello.ts`:

```typescript
const greet = (name: string): string => {
  return `Hello, ${name}! Welcome to TaskFlow.`;
};

console.log(greet("Developer"));
console.log(`Bun version: ${Bun.version}`);
```

Run it:

```bash
bun run src/hello.ts
```

Expected output:
```
Hello, Developer! Welcome to TaskFlow.
Bun version: 1.x.xx
```

> ❓ **Notice**: No compilation step is needed. How does this differ from running TypeScript with `ts-node` on Node.js? What does this mean for your development workflow?

### 2b. TypeScript Types

Create `src/types/task.ts`:

```typescript
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export type CreateTaskInput = Omit<Task, "id" | "createdAt">;
export type UpdateTaskInput = Partial<CreateTaskInput>;
```

> ❓ **Think about it**: What is the difference between `Omit<Task, "id" | "createdAt">` and manually rewriting the interface without those fields? Which approach is safer when the `Task` interface changes?

---

## 3. Environment Variables & Watch Mode

### 3a. Create .env File

Create `.env` in your project root:

```env
APP_PORT=3000
APP_ENV=development
API_SECRET_KEY=taskflow-secret-2024
DB_FILE=./data/tasks.json
```

### 3b. Read Environment Variables

Create `src/config.ts`:

```typescript
export const config = {
  port: Number(process.env.APP_PORT) || 3000,
  env: process.env.APP_ENV || "development",
  secretKey: process.env.API_SECRET_KEY,
  dbFile: process.env.DB_FILE || "./data/tasks.json",
};

console.log("Config loaded:", config);
```

Run:

```bash
bun run src/config.ts
```

> ❓ **Why doesn't Bun need `dotenv`?** What does this mean in terms of production dependencies?

### 3c. Bunfig Configuration

Create `bunfig.toml`:

```toml
logLevel = "info"

[test]
root = "./test"
coverage = true
```

### 3d. Watch Mode

Run your entry file with hot reload during development:

```bash
bun run --hot src/config.ts
```

Now edit the `APP_PORT` value in `.env`, save it, and observe the output in your terminal.

> ❓ **What is the difference between `--hot` and `--watch`?** Check the Bun docs and compare their behavior when a file changes.

---

## 4. Built-in HTTP Server

### 4a. Basic Server with Bun.serve

Before using Hono, let's explore Bun's raw HTTP server. Create `src/raw-server.ts`:

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(JSON.stringify({ message: "TaskFlow API", version: "1.0.0" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", uptime: process.uptime() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
```

Run it:

```bash
bun run src/raw-server.ts
```

Test in your browser or with curl:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/unknown
```

> ❓ **What Web Standard classes are being used here?** Why is this significant when comparing Bun to Node.js's `http` module?

---

## 5. File I/O & Hashing

### 5a. Initialize the Data File

Create the `data/` directory and `data/tasks.json`:

```json
[]
```

### 5b. File I/O Utilities

Create `src/db.ts`:

```typescript
import { config } from "./config";
import type { Task } from "./types/task";

export async function readTasks(): Promise<Task[]> {
  const file = Bun.file(config.dbFile);

  const exists = await file.exists();
  if (!exists) {
    await Bun.write(config.dbFile, "[]");
    return [];
  }

  const content = await file.text();
  return JSON.parse(content) as Task[];
}

export async function writeTasks(tasks: Task[]): Promise<void> {
  await Bun.write(config.dbFile, JSON.stringify(tasks, null, 2));
}
```

> ❓ **What happens if `Bun.file()` is called on a file that doesn't exist?** The code above handles this case — can you identify where and how?

### 5c. Password Hashing

Create `src/auth.ts`:

```typescript
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash, "bcrypt");
}

// Test it
const password = "admin123";
const hashed = await hashPassword(password);
console.log("Hashed:", hashed);

const isValid = await verifyPassword(password, hashed);
const isInvalid = await verifyPassword("wrongpassword", hashed);

console.log("Correct password:", isValid);    // true
console.log("Wrong password:", isInvalid);    // false
```

Run:

```bash
bun run src/auth.ts
```

> ❓ **Why is the `cost` parameter important in bcrypt?** What is the tradeoff between a higher cost and a lower cost?

---

## 6. Package Manager

### 6a. Install Dependencies

Install all packages needed for the project:

```bash
# Core framework
bun add hono

# Validation
bun add zod @hono/zod-validator

# Utilities
bun add uuid

# Dev types
bun add @types/uuid --dev
```

### 6b. Verify Installed Packages

Check your `package.json` — it should now list:

```json
{
  "dependencies": {
    "hono": "^4.x.x",
    "zod": "^3.x.x",
    "@hono/zod-validator": "^0.x.x",
    "uuid": "^9.x.x"
  }
}
```

> ❓ **Where does Bun store its package cache?** Run `bun pm cache` to find out. Why does caching matter for install speed?

### 6c. Using bunx

Run a package binary without installing it globally:

```bash
bunx tsc --version
```

> ❓ **What is `bunx` equivalent to in the npm ecosystem?** When would you prefer `bunx` over a locally installed binary?

---

## 7. Test Runner

### 7a. Write Your First Unit Test

Create `test/task.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import type { Task } from "../src/types/task";

function createTask(title: string, priority: Task["priority"] = "medium"): Task {
  return {
    id: crypto.randomUUID(),
    title,
    description: "",
    completed: false,
    priority,
    createdAt: new Date().toISOString(),
  };
}

function filterByPriority(tasks: Task[], priority: Task["priority"]): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

function countCompleted(tasks: Task[]): number {
  return tasks.filter((t) => t.completed).length;
}

describe("Task Utilities", () => {
  let tasks: Task[];

  beforeEach(() => {
    tasks = [
      createTask("Buy groceries", "low"),
      createTask("Write report", "high"),
      createTask("Call doctor", "medium"),
      createTask("Fix bug", "high"),
    ];
    tasks[0].completed = true;
  });

  it("should create a task with correct defaults", () => {
    const task = createTask("Test task");
    expect(task.completed).toBe(false);
    expect(task.priority).toBe("medium");
    expect(task.title).toBe("Test task");
    expect(task.id).toBeTruthy();
  });

  it("should filter tasks by priority", () => {
    const highPriority = filterByPriority(tasks, "high");
    expect(highPriority).toHaveLength(2);
    expect(highPriority.every((t) => t.priority === "high")).toBe(true);
  });

  it("should count completed tasks correctly", () => {
    const completed = countCompleted(tasks);
    expect(completed).toBe(1);
  });

  it("should return empty array when no tasks match priority", () => {
    const result = filterByPriority([], "low");
    expect(result).toHaveLength(0);
  });
});
```

Run tests:

```bash
bun test
```

Expected output:
```
bun test v1.x.xx

test/task.test.ts:
✓ Task Utilities > should create a task with correct defaults
✓ Task Utilities > should filter tasks by priority
✓ Task Utilities > should count completed tasks correctly
✓ Task Utilities > should return empty array when no tasks match priority

4 pass
0 fail
```

> ❓ **What does `beforeEach()` do here?** Why is it important that each test starts with a fresh `tasks` array instead of sharing state?

### 7b. Run Tests with Coverage

Make sure your `bunfig.toml` has `coverage = true`, then run:

```bash
bun test --coverage
```

> ❓ **What does code coverage tell you?** Is 100% coverage always the goal? What are its limitations?

---

## 8. Hono Setup & Routing

### 8a. Create the Main App

Create `src/index.ts`:

```typescript
import { Hono } from "hono";
import { config } from "./config";
import { taskRoutes } from "./routes/task";

const app = new Hono();

// Root route
app.get("/", (c) => {
  return c.json({
    message: "TaskFlow API",
    version: "1.0.0",
    docs: "/api/tasks",
  });
});

// Mount task routes
app.route("/api", taskRoutes);

// Start server
export default {
  port: config.port,
  fetch: app.fetch,
};

console.log(`🚀 TaskFlow API running at http://localhost:${config.port}`);
```

### 8b. Create Task Routes

Create `src/routes/task.ts`:

```typescript
import { Hono } from "hono";
import { readTasks, writeTasks } from "../db";
import type { Task } from "../types/task";
import { v4 as uuidv4 } from "uuid";

export const taskRoutes = new Hono().basePath("/tasks");

// GET /api/tasks — List all tasks
taskRoutes.get("/", async (c) => {
  const tasks = await readTasks();
  return c.json({ data: tasks, count: tasks.length });
});

// GET /api/tasks/:id — Get single task
taskRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const tasks = await readTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json({ data: task });
});

// POST /api/tasks — Create task
taskRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const tasks = await readTasks();

  const newTask: Task = {
    id: uuidv4(),
    title: body.title,
    description: body.description || "",
    completed: false,
    priority: body.priority || "medium",
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  await writeTasks(tasks);

  return c.json({ data: newTask, message: "Task created successfully" }, 201);
});

// PUT /api/tasks/:id — Update task
taskRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return c.json({ error: "Task not found" }, 404);
  }

  tasks[index] = { ...tasks[index], ...body };
  await writeTasks(tasks);

  return c.json({ data: tasks[index], message: "Task updated successfully" });
});

// DELETE /api/tasks/:id — Delete task
taskRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return c.json({ error: "Task not found" }, 404);
  }

  const deleted = tasks.splice(index, 1)[0];
  await writeTasks(tasks);

  return c.json({ data: deleted, message: "Task deleted successfully" });
});
```

Start the server:

```bash
bun run dev
```

Test your routes:

```bash
# List all tasks
curl http://localhost:3000/api/tasks

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Bun", "priority": "high"}'

# Get a specific task (replace {id})
curl http://localhost:3000/api/tasks/{id}
```

> ❓ **Explain `.basePath("/tasks")` in the `taskRoutes` definition.** How does it affect how routes are registered when using `app.route("/api", taskRoutes)`?

---

## 9. Middleware & Error Handling

### 9a. Create Auth Middleware

Create `src/middleware/auth.ts`:

```typescript
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { config } from "../config";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      res: Response.json({ error: "Missing or invalid Authorization header" }, { status: 401 }),
    });
  }

  const token = authHeader.replace("Bearer ", "");

  if (token !== config.secretKey) {
    throw new HTTPException(403, {
      res: Response.json({ error: "Forbidden: Invalid token" }, { status: 403 }),
    });
  }

  await next();
});
```

### 9b. Apply Middleware to Routes

Update `src/routes/task.ts` to protect write operations:

```typescript
import { authMiddleware } from "../middleware/auth";

// Protect POST, PUT, DELETE — add middleware before handler
taskRoutes.post("/", authMiddleware, async (c) => { /* ... */ });
taskRoutes.put("/:id", authMiddleware, async (c) => { /* ... */ });
taskRoutes.delete("/:id", authMiddleware, async (c) => { /* ... */ });
```

### 9c. Global Error Handler

Add to `src/index.ts`:

```typescript
import { HTTPException } from "hono/http-exception";

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => {
  return c.json({ error: `Route ${c.req.path} not found` }, 404);
});
```

Test authorization:

```bash
# This should return 401
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Unauthorized task"}'

# This should work (replace with your API_SECRET_KEY from .env)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer taskflow-secret-2024" \
  -d '{"title": "Authorized task", "priority": "high"}'
```

> ❓ **What does `await next()` do inside a middleware?** What happens if you remove it? Try it and observe the behavior.

---

## 10. RESTful API — Task CRUD

### 10a. Complete CRUD Test Table

After implementing all routes, verify each endpoint works as expected:

| Method | Endpoint | Auth Required | Expected Status | Description |
|--------|----------|---------------|-----------------|-------------|
| GET | `/api/tasks` | ❌ | 200 | List all tasks |
| GET | `/api/tasks/:id` | ❌ | 200 / 404 | Get single task |
| POST | `/api/tasks` | ✅ | 201 | Create new task |
| PUT | `/api/tasks/:id` | ✅ | 200 / 404 | Update task |
| DELETE | `/api/tasks/:id` | ✅ | 200 / 404 | Delete task |

### 10b. Query Parameter Filtering

Add a filter feature to the GET all tasks route in `src/routes/task.ts`:

```typescript
taskRoutes.get("/", async (c) => {
  const tasks = await readTasks();
  const priority = c.req.query("priority");
  const completed = c.req.query("completed");

  let filtered = tasks;

  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (completed !== undefined) {
    const isCompleted = completed === "true";
    filtered = filtered.filter((t) => t.completed === isCompleted);
  }

  return c.json({ data: filtered, count: filtered.length });
});
```

Test the filters:

```bash
# Get only high-priority tasks
curl "http://localhost:3000/api/tasks?priority=high"

# Get only completed tasks
curl "http://localhost:3000/api/tasks?completed=true"

# Combine filters
curl "http://localhost:3000/api/tasks?priority=high&completed=false"
```

> ❓ **What is the difference between `c.req.query("priority")` returning `undefined` vs returning an empty string `""`?** How does your filter logic handle each case?

---

## 11. Validation with Zod

### 11a. Define Schemas

Create `src/validation/task.ts`:

```typescript
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().max(500).optional().default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  completed: z.boolean().optional().default(false),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

### 11b. Apply Validation to Routes

Update the POST and PUT handlers in `src/routes/task.ts`:

```typescript
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema, updateTaskSchema } from "../validation/task";

// POST — with validation
taskRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createTaskSchema),
  async (c) => {
    const body = c.req.valid("json"); // fully typed and validated
    const tasks = await readTasks();

    const newTask: Task = {
      id: uuidv4(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    await writeTasks(tasks);

    return c.json({ data: newTask, message: "Task created successfully" }, 201);
  }
);

// PUT — with validation
taskRoutes.put(
  "/:id",
  authMiddleware,
  zValidator("json", updateTaskSchema),
  async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return c.json({ error: "Task not found" }, 404);
    }

    tasks[index] = { ...tasks[index], ...body };
    await writeTasks(tasks);

    return c.json({ data: tasks[index], message: "Task updated successfully" });
  }
);
```

Test validation errors:

```bash
# Missing required title — should return 400
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer taskflow-secret-2024" \
  -d '{"priority": "high"}'

# Invalid priority value — should return 400
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer taskflow-secret-2024" \
  -d '{"title": "Test", "priority": "urgent"}'
```

> ❓ **What is `z.infer<typeof createTaskSchema>`?** Why is it better than manually writing a TypeScript interface that mirrors the Zod schema?

---

## 12. Testing the API

### 12a. API Integration Tests

Create `test/api.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from "bun:test";
import app from "../src/index";

const AUTH_HEADER = `Bearer ${process.env.API_SECRET_KEY || "taskflow-secret-2024"}`;
let createdTaskId: string;

describe("TaskFlow API", () => {
  describe("GET /api/tasks", () => {
    it("should return task list with count", async () => {
      const res = await app.fetch(new Request("http://localhost/api/tasks"));
      const body = await res.json() as any;

      expect(res.status).toBe(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("count");
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a task with valid data and token", async () => {
      const res = await app.fetch(
        new Request("http://localhost/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_HEADER,
          },
          body: JSON.stringify({ title: "Test Task", priority: "high" }),
        })
      );

      const body = await res.json() as any;
      expect(res.status).toBe(201);
      expect(body.data.title).toBe("Test Task");
      expect(body.data.priority).toBe("high");
      expect(body.data.completed).toBe(false);

      createdTaskId = body.data.id;
    });

    it("should return 401 when Authorization header is missing", async () => {
      const res = await app.fetch(
        new Request("http://localhost/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Unauthorized" }),
        })
      );

      expect(res.status).toBe(401);
    });

    it("should return 400 when title is missing", async () => {
      const res = await app.fetch(
        new Request("http://localhost/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_HEADER,
          },
          body: JSON.stringify({ priority: "low" }),
        })
      );

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a specific task by id", async () => {
      const res = await app.fetch(
        new Request(`http://localhost/api/tasks/${createdTaskId}`)
      );

      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.data.id).toBe(createdTaskId);
    });

    it("should return 404 for non-existent task", async () => {
      const res = await app.fetch(
        new Request("http://localhost/api/tasks/non-existent-id")
      );

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update an existing task", async () => {
      const res = await app.fetch(
        new Request(`http://localhost/api/tasks/${createdTaskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_HEADER,
          },
          body: JSON.stringify({ completed: true }),
        })
      );

      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.data.completed).toBe(true);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete an existing task", async () => {
      const res = await app.fetch(
        new Request(`http://localhost/api/tasks/${createdTaskId}`, {
          method: "DELETE",
          headers: { Authorization: AUTH_HEADER },
        })
      );

      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.message).toBe("Task deleted successfully");
    });

    it("should return 404 after task is deleted", async () => {
      const res = await app.fetch(
        new Request(`http://localhost/api/tasks/${createdTaskId}`)
      );

      expect(res.status).toBe(404);
    });
  });
});
```

Run all tests:

```bash
bun test
```

> ❓ **How does `app.fetch(new Request(...))` work without starting a server?** Why is this approach faster and more reliable than spinning up a real HTTP server for tests?

> ❓ **Notice the test order dependency** — the DELETE tests rely on `createdTaskId` set in the POST test. What could go wrong with this approach? How would you make the tests fully independent?

---

## 13. Build & Executable

### 13a. Bundle the Project

```bash
bun build src/index.ts --outdir dist --minify --sourcemap
```

Check the output:

```bash
ls -lh dist/
```

> ❓ **What does `--minify` do?** When would you skip minification during a build?

### 13b. Compile to a Standalone Executable

```bash
bun build src/index.ts --compile --outfile build/taskflow
```

Run the standalone binary (no Bun installation required):

```bash
./build/taskflow
```

Test it:

```bash
curl http://localhost:3000/api/tasks
```

> ❓ **What is included in the compiled binary?** What does `--compile` embed that makes the binary self-contained?

### 13c. Cross-Compilation (Optional)

To build for a different platform (e.g., Linux AMD64 from macOS):

```bash
bun build src/index.ts \
  --compile \
  --target=bun-linux-x64 \
  --outfile build/taskflow-linux
```

---

## 📈 Expected Test Results Summary

After completing all spec files, your full test run should produce:

| Test File | Tests | Expected Result |
|-----------|-------|-----------------|
| `test/task.test.ts` | 4 | ✅ All Pass |
| `test/api.test.ts` | 8 | ✅ All Pass |
| **Total** | **12** | **✅ 12 Pass, 0 Fail** |

---

## 🏆 Challenge Tasks

Once you've completed all the steps above, try these on your own:

1. **Add pagination to GET /api/tasks** — support `?page=1&limit=10` query parameters and return metadata like `totalPages` and `currentPage` in the response.

2. **Add a PATCH /api/tasks/:id/complete endpoint** — a dedicated route to toggle a task's `completed` status without needing to send the full body.

3. **Add request logging middleware** — create a custom middleware that logs the method, path, status code, and response time for every request to the console.

4. **Persist user sessions with cookies** — use `setCookie` and `getCookie` from `hono/cookie` to store and read a session token after a simulated login.

5. **Add a GET /api/tasks/stats endpoint** — return a summary object containing `total`, `completed`, `pending`, and a breakdown of tasks by priority (`low`, `medium`, `high`).

6. **Write a test for the query parameter filter** — add test cases to `api.test.ts` that verify `?priority=high` only returns high-priority tasks and `?completed=true` only returns completed tasks.

7. **Add JSX support with Hono** — create a `/web/tasks` route in a `src/web.tsx` file that renders the task list as an HTML page using Hono's JSX support.

8. **Use Bun Workspace** — split the project into a monorepo with two sub-packages: `packages/api` (the Hono server) and `packages/core` (the task utilities and types), linked through the workspace feature.

---

## ✅ Concepts Covered

| Concept | Where Practiced |
|---|---|
| Installation & Project Init | Step 1 |
| Running TypeScript Natively | Step 2a |
| TypeScript Interfaces & Utility Types | Step 2b |
| `.env` & `process.env` | Step 3a, 3b |
| `bunfig.toml` Configuration | Step 3c |
| `--hot` / `--watch` Mode | Step 3d |
| `Bun.serve()` HTTP Server | Step 4a |
| Web Standard APIs (Request, Response, URL) | Step 4a |
| `Bun.file()` & `Bun.write()` | Step 5b |
| `Bun.password.hash()` & `.verify()` | Step 5c |
| `bun add` / `bun install` | Step 6a |
| `bunx` Package Runner | Step 6c |
| `bun test` & `describe` / `it` / `expect` | Step 7a |
| `beforeEach()` Hook | Step 7a |
| `bun test --coverage` | Step 7b |
| Hono App Setup & `export default` | Step 8a |
| HTTP Method Routing | Step 8b |
| `.basePath()` & Sub-routing | Step 8b |
| Path Params (`c.req.param`) | Step 8b |
| Query Params (`c.req.query`) | Step 10b |
| Custom Middleware | Step 9a |
| `HTTPException` | Step 9a |
| `app.onError()` & `app.notFound()` | Step 9c |
| `await next()` in Middleware | Step 9 |
| Zod Schema Definition | Step 11a |
| `zValidator` Integration | Step 11b |
| `z.infer<>` TypeScript Types | Step 11a |
| API Integration Testing with `app.fetch()` | Step 12a |
| `bun build` — Bundling | Step 13a |
| `--compile` — Standalone Binary | Step 13b |
| Cross-compilation with `--target` | Step 13c |
