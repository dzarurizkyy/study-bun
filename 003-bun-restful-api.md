# 🚀 Hono RESTful API — Contact Management

Study notes for building a RESTful API for **Contact Management** using **Hono** on **Bun**, with **Prisma** (MariaDB) and **Zod**. Split into 3 interdependent modules — **User Management** → **Contact Management** → **Address Management** — each built up stage by stage (endpoint by endpoint), based on [`study-bun/3-bun-hono-restful-api`](https://github.com/dzarurizkyy/study-bun/tree/main/3-bun-hono-restful-api).

---

## 📋 Table of Contents

- [Requirement](#-requirement)
- [Project Setup](#-project-setup)
  - [Creating the Project](#creating-the-project)
  - [Adding Zod](#adding-zod)
  - [Adding Winston](#adding-winston)
  - [Adding Prisma + the MariaDB Adapter](#adding-prisma--the-mariadb-adapter)
  - [Setting Up the TypeScript Config](#setting-up-the-typescript-config)
- [Database Design](#-database-design)
  - [Setting Up the Database](#setting-up-the-database)
  - [Setting Up Prisma](#setting-up-prisma)
  - [User Model](#user-model)
  - [Contact Model](#contact-model)
  - [Address Model](#address-model)
- [Application Foundation](#-application-foundation)
- [Part 1 — User Management](#-part-1--user-management)
  - [User API Spec](#user-api-spec)
  - [Stage 1: Register User](#stage-1-register-user)
  - [Stage 2: Login User](#stage-2-login-user)
  - [Stage 3: Get Current User](#stage-3-get-current-user)
  - [Stage 4: Update User](#stage-4-update-user)
  - [Stage 5: Logout User](#stage-5-logout-user)
- [Part 2 — Contact Management](#-part-2--contact-management)
  - [Contact API Spec](#contact-api-spec)
  - [Stage 1: Create Contact](#stage-1-create-contact)
  - [Stage 2: Get Contact](#stage-2-get-contact)
  - [Stage 3: Update & Delete Contact](#stage-3-update--delete-contact)
  - [Stage 4: Search Contact](#stage-4-search-contact)
- [Part 3 — Address Management](#-part-3--address-management)
  - [Address API Spec](#address-api-spec)
  - [Stage 1: Create Address](#stage-1-create-address)
  - [Stage 2: Get Address](#stage-2-get-address)
  - [Stage 3: Update Address](#stage-3-update-address)
  - [Stage 4: Remove Address](#stage-4-remove-address)
  - [Stage 5: List Address](#stage-5-list-address)
- [Running the Project](#-running-the-project)
- [Manual Testing](#-manual-testing)
- [Quick Reference](#-quick-reference)
  - [All Endpoints](#all-endpoints)
  - [Folder Structure](#folder-structure)
- [Key Takeaways](#-key-takeaways)

---

## 🎯 Requirement

The RESTful API for Contact Management has 3 major features:

1. **User Management** — register, login, view profile, update profile, logout
2. **Contact Management** — contact CRUD + search
3. **Address Management** — address CRUD, an address always belongs to a contact

**User Data**: `username`, `password`, `name`

**User API**: Register User, Login User, Get Current User, Update User, Logout User

**Contact Data**: `first_name`, `last_name`, `email`, `phone`

**Contact API**: Create Contact, Get Contact, Update Contact, Delete Contact, Search Contact

**Contact Address Data**: `street`, `city`, `province`, `country`, `postal_code`

**Address API**: Create Address, Get Address, Update Address, Remove Address, List Address

> **Key Insight:** The relationship forms an ownership chain: `User → Contact → Address`. A contact **must** belong to the currently logged-in user, and an address **must** belong to a valid contact. This `xMustExists` pattern (`ContactService.contactMustExists`, `AddressService.addressMustExists`) repeats across modules and is the backbone of data authorization throughout the API.

---

## 🏗️ Project Setup

### Creating the Project

```bash
bun create hono study-bun-hono-restful-api
```

Choose the **`bun`** template when prompted.

### Adding Zod

For request body/query validation. Every request type in this project is later *derived* from a Zod schema with `z.infer`, rather than hand-declared separately.

```bash
bun add zod
```

### Adding Winston

For structured logging.

```bash
bun add winston
```

> Reference: [npmjs.com/package/winston](https://www.npmjs.com/package/winston)

### Adding Prisma + the MariaDB Adapter

ORM for talking to MariaDB. Prisma needs an explicit **driver adapter** per database — here that's `@prisma/adapter-mariadb`, backed by the `mariadb` driver.

```bash
bun add prisma --dev
bun add @prisma/client @prisma/adapter-mariadb mariadb
```

> Reference: [prisma.io](https://www.prisma.io/) · [npmjs.com/package/mariadb](https://www.npmjs.com/package/mariadb)

### Setting Up the TypeScript Config

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

> **Note:** Unlike a `tsc`-compiled project, this `tsconfig.json` only configures type-checking and the JSX transform — there's no `include`/`exclude`/`rootDir`/`outDir` wiring, because Bun runs `.ts` files directly (no separate compile step for `bun run --hot`). The `jsx`/`jsxImportSource` pair is here because `bun create hono`'s `bun` template ships it by default, even though this project never actually renders JSX — harmless to leave in.

---

## 🗄️ Database Design

### Setting Up the Database

> This step's exact terminal transcript wasn't captured in the source project — the outline below is the standard way to stand up a local MariaDB instance matching the `mysql://` connection string used in `.env`.

```bash
docker run --name study-bun-hono-mariadb \
  -e MARIADB_ROOT_PASSWORD=<password> \
  -e MARIADB_DATABASE=study_bun_hono \
  -p 3306:3306 -d mariadb:11
```

**`.env`**

```env
DATABASE_URL="mysql://root:<password>@localhost:3306/study_bun_hono"
```

> ⚠️ **Note:** The repo's actual committed `.env` has a real local password in it, and `.gitignore` only excludes `node_modules/`, `/src/generated/prisma`, and the compiled `hono-restful-api` binary — `.env` itself isn't listed. Worth adding `.env` to `.gitignore`, even for a throwaway local study project, so a local credential doesn't sit in a public repo's history.

### Setting Up Prisma

```bash
bunx prisma init --datasource-provider mysql
```

> **Note:** Prisma's generated `schema.prisma` still has its default template comment — `"Get a free hosted Postgres database in seconds"` — left over from `prisma init`, even though this project uses MySQL/MariaDB. Harmless, but a reminder that scaffold comments don't auto-update for your actual choice of database.

**`prisma.config.ts`**

```typescript
// This file was generated by Prisma, and assumes you have installed the following:
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### User Model

```prisma
model User {
  username String    @id @db.VarChar(100)
  password String    @db.VarChar(100)
  name     String    @db.VarChar(100)
  token    String?   @db.VarChar(100)
  contacts Contact[]

  @@map("user")
}
```

```bash
bunx prisma migrate dev --name create_users_table
```

```sql
-- CreateTable
CREATE TABLE `user` (
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `token` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Later, once [Logout](#stage-5-logout-user) needed to clear a user's token back to nothing, `token` was made nullable:

```bash
bunx prisma migrate dev --name make_token_at_optional
```

```sql
-- AlterTable
ALTER TABLE `user` MODIFY `token` VARCHAR(100) NULL;
```

### Contact Model

Contact needs a relation to `User` (one user has many contacts).

```prisma
model Contact {
  id         Int     @id @default(autoincrement()) @db.Int
  first_name String  @db.VarChar(100)
  last_name  String? @db.VarChar(100)
  email      String? @db.VarChar(100)
  phone      String? @db.VarChar(20)

  username String @db.VarChar(100)
  user     User   @relation(fields: [username], references: [username])

  addresses Address[]

  @@map("contact")
}
```

```bash
bunx prisma migrate dev --name create_contacts_table
```

```sql
-- CreateTable
CREATE TABLE `contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `username` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_username_fkey` FOREIGN KEY (`username`) REFERENCES `user`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Address Model

Address attaches to `Contact` (one contact has many addresses). `street`, `city`, and `province` are optional from the start here — `country` and `postal_code` stay required.

```prisma
model Address {
  id          Int     @id @default(autoincrement())
  street      String? @db.VarChar(255)
  city        String? @db.VarChar(100)
  province    String? @db.VarChar(100)
  postal_code String  @db.VarChar(10)
  country     String  @db.VarChar(100)

  contact_id Int     @db.Int
  contact    Contact @relation(fields: [contact_id], references: [id])

  @@map("address")
}
```

```bash
bunx prisma migrate dev --name create_addreses_table
```

```sql
-- CreateTable
CREATE TABLE `address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `street` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `postal_code` VARCHAR(10) NOT NULL,
    `country` VARCHAR(100) NOT NULL,
    `contact_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `address_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
```

> **Note:** The migration folder name itself is spelled `create_addreses_table` (missing the second "s") — kept here exactly as it exists in the repo, since renaming an already-applied migration folder would desync it from Prisma's migration history table.

---

## ⚙️ Application Foundation

Before touching features, set up the infrastructure shared by every module: logging, the database client, and the app skeleton with centralized error handling.

**`src/application/logging.ts`**

```typescript
import * as winston from "winston";

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
```

**`src/application/database.ts`**

```typescript
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { logger } from "./logging";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export const prismaClient = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prismaClient.$on("query", (e) => {
  logger.info(e);
});

prismaClient.$on("error", (e) => {
  logger.error(e);
});

prismaClient.$on("info", (e) => {
  logger.info(e);
});

prismaClient.$on("warn", (e) => {
  logger.warn(e);
});
```

- The Prisma client is wired to a `PrismaMariaDb` adapter instance rather than connecting directly — every query/warn/error event is then routed through Winston instead of `console.log`.

**`src/index.ts`** (initial version — controllers are mounted stage by stage below)

```typescript
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({ errors: err.message });
  } else if (err instanceof ZodError) {
    c.status(400);
    return c.json({ errors: err.message });
  } else {
    c.status(500);
    return c.json({ errors: "Internal Server Error" });
  }
});

export default app;
```

> **Key Insight:** `app.onError` plays the role a dedicated error middleware plays in Express-style frameworks — it's the **only** place that turns an error into an HTTP response. `HTTPException` → its own carried status, `ZodError` → `400`, anything else → `500`. Services and controllers below never call `c.json` for an error themselves; they just `throw`.

---

## 👤 Part 1 — User Management

### User API Spec

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/users` | - | Register a new user |
| POST | `/api/users/login` | - | Login, receive a token |
| GET | `/api/users/current` | ✅ | Get the logged-in user's data |
| PATCH | `/api/users/current` | ✅ | Update name/password |
| DELETE | `/api/users/logout` | ✅ | Clear the token (logout) |

> Full request/response spec lives in [`doc/user.md`](doc/user.md) — though see the note under [Stage 5](#stage-5-logout-user): the implemented logout route and response shape both differ slightly from what that file describes.

---

### Stage 1: Register User

**`src/validation/user-validation.ts`**

```typescript
import { z } from "zod";

export class UserValidation {
  static readonly REGISTER = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    name: z.string().min(1).max(100),
  });
}
```

**`src/model/user-model.ts`**

```typescript
import z from "zod";
import { User } from "../generated/prisma";
import { UserValidation } from "../validation/user-validation";

export type RegisterUserRequest = z.infer<typeof UserValidation.REGISTER>;

export type UserResponse = {
  username: string;
  name: string;
  token?: string;
};

export function toUserResponse(user: User): UserResponse {
  return {
    username: user.username,
    name: user.name,
  };
}
```

> **Key Insight:** Every request type in this project is derived straight from its Zod schema with `z.infer<typeof Schema>`, instead of being hand-declared separately. The schema is the single source of truth for both the runtime validation *and* the compile-time type — change a field in `UserValidation.REGISTER` and `RegisterUserRequest` updates automatically, with no risk of the two drifting apart.

**`src/service/user-service.ts`**

```typescript
import { prismaClient } from "../application/database";
import { RegisterUserRequest, toUserResponse, UserResponse } from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import { HTTPException } from "hono/http-exception";

export class UserService {
  static async register(request: RegisterUserRequest): Promise<UserResponse> {
    request = UserValidation.REGISTER.parse(request);

    const totalUserWithUsername = await prismaClient.user.count({
      where: { username: request.username },
    });

    if (totalUserWithUsername !== 0) {
      throw new HTTPException(400, { message: "Username already exists" });
    }

    request.password = await Bun.password.hash(request.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await prismaClient.user.create({ data: request });

    return toUserResponse(user);
  }
}
```

- The password is **never** returned to the client — `toUserResponse` only maps `username` and `name`.
- `Bun.password.hash` is Bun's own standard-library hashing API — no `bcrypt` npm package needed at all.
- There's no shared `Validation.validate<T>()` helper here; each service method calls its own schema's `.parse()` directly. Slightly more repetition across methods, but one less layer of indirection.

**`src/controller/user-controller.ts`**

```typescript
import { Hono } from "hono";
import { UserService } from "../service/user-service";
import { ApplicationVariables } from "../model/app-model";
import { RegisterUserRequest } from "../model/user-model";

export const UserController = new Hono<{ Variables: ApplicationVariables }>();

UserController.post("/api/users", async (c) => {
  const request = (await c.req.json()) as RegisterUserRequest;
  const response = await UserService.register(request);

  return c.json({ data: response }, 200);
});
```

> **Note:** `c.req.json()` is only *type-asserted* to `RegisterUserRequest` here — the actual validation happens one level down, inside `UserService.register`, via `UserValidation.REGISTER.parse(request)`. The controller trusts the assertion and defers all real validation to the service.

**`src/index.ts`** (mount `UserController` for the first time)

```typescript
import { Hono } from "hono";
import { UserController } from "./controller/user-controller";
// ...HTTPException, ZodError, onError as before...

const app = new Hono();

app.route("/", UserController);
```

**`src/test/test-util.ts`**

```typescript
import { prismaClient } from "../application/database";

export class UserTest {
  static async create() {
    await prismaClient.user.create({
      data: {
        username: "test",
        name: "test",
        password: await Bun.password.hash("test", { algorithm: "bcrypt", cost: 10 }),
        token: "test",
      },
    });
  }

  static async delete() {
    await prismaClient.user.deleteMany({ where: { username: "test" } });
  }
}
```

**`src/test/user.test.ts`**

```typescript
import app from "../index";
import { afterEach, describe, expect, it } from "bun:test";
import { UserTest } from "./test-util";

describe("POST /api/users", () => {
  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject register new user if request is invalid", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "", password: "", name: "" }),
    });

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should reject register new user if username already exists", async () => {
    await UserTest.create();

    const response = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test", password: "test", name: "test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should register new user success", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      body: JSON.stringify({ username: "test", password: "test", name: "test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.username).toBe("test");
    expect(body.data.name).toBe("test");
  });
});
```

---

### Stage 2: Login User

**`src/validation/user-validation.ts`** (add `LOGIN`)

```typescript
static readonly LOGIN = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});
```

**`src/model/user-model.ts`** (add `LoginUserRequest`)

```typescript
export type LoginUserRequest = z.infer<typeof UserValidation.LOGIN>;
```

**`src/service/user-service.ts`** (add the `login` method)

```typescript
static async login(request: LoginUserRequest): Promise<UserResponse> {
  request = UserValidation.LOGIN.parse(request);

  let user = await prismaClient.user.findUnique({
    where: { username: request.username },
  });

  if (!user) {
    throw new HTTPException(401, { message: "Username or password is wrong" });
  }

  const isPasswordValid = await Bun.password.verify(request.password, user.password, "bcrypt");

  if (!isPasswordValid) {
    throw new HTTPException(401, { message: "Username or password is wrong" });
  }

  user = await prismaClient.user.update({
    where: { username: user.username },
    data: { token: crypto.randomUUID() },
  });

  const response = toUserResponse(user);
  response.token = user.token!;
  return response;
}
```

> **Key Insight:** The error message for a wrong username and a wrong password is **deliberately the same** (`"Username or password is wrong"`) — if they differed, an attacker could tell which usernames exist just from the difference in error messages (user enumeration). Also note `crypto.randomUUID()` — a Web Standard global available directly in Bun — replaces what a Node/Express project would need the `uuid` npm package for.

**`src/controller/user-controller.ts`** (add `login`)

```typescript
UserController.post("/api/users/login", async (c) => {
  const request = (await c.req.json()) as LoginUserRequest;
  const response = await UserService.login(request);

  return c.json({ data: response }, 200);
});
```

**`src/test/user.test.ts`** (add `describe("POST /api/users/login")`)

```typescript
describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should be rejected if username is wrong", async () => {
    const response = await app.request("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "wrong", password: "test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should be able to login", async () => {
    const response = await app.request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ username: "test", password: "test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.username).toBe("test");
    expect(body.data.token).toBeDefined();
  });
});
```

---

### Stage 3: Get Current User

The first endpoint that requires **authentication**. This introduces `ApplicationVariables` (Hono's typed context storage) and `authMiddleware`.

**`src/model/app-model.ts`**

```typescript
import { User } from "../generated/prisma";

export type ApplicationVariables = {
  user: User;
};
```

**`src/validation/user-validation.ts`** (add `TOKEN`)

```typescript
static readonly TOKEN = z.string().min(1);
```

**`src/service/user-service.ts`** (add the `get` method)

```typescript
static async get(token: string | undefined): Promise<User> {
  const result = UserValidation.TOKEN.safeParse(token);
  if (!result.success) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  token = result.data;

  const user = await prismaClient.user.findFirst({ where: { token } });

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user;
}
```

**`src/middleware/auth-middlewate.ts`**

```typescript
import { MiddlewareHandler } from "hono";
import { UserService } from "../service/user-service";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header("Authorization");

  const user = await UserService.get(token);

  c.set("user", user);
  await next();
};
```

> **Note:** The middleware itself is a thin wrapper — all real validation (is there a token at all? does it match a user?) happens inside `UserService.get`. Also notice the header is read as a **raw token value**, with no `Bearer` prefix expected — unlike a standard `Authorization: Bearer <token>` convention, the client sends the token itself as the header value.

**`src/controller/user-controller.ts`** (add `authMiddleware` + `get`)

```typescript
import { User } from "../generated/prisma";
import { toUserResponse } from "../model/user-model";
import { authMiddleware } from "../middleware/auth-middlewate";

UserController.use(authMiddleware);

UserController.get("/api/users/current", async (c) => {
  const user = c.get("user") as User;

  return c.json({ data: toUserResponse(user) });
});
```

> **Tip:** Middleware registered with `.use()` only applies to routes registered **after** it on that same Hono instance — that's why `register`/`login` (defined earlier) stay public, while `current`/`update`/`logout` (defined after this line) all require auth.

**`src/test/user.test.ts`** (add `describe("GET /api/users/current")`)

```typescript
describe("GET /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should not be able to get user if there is no Authorization Header", async () => {
    const response = await app.request("/api/users/current", { method: "GET" });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should be able to get current user", async () => {
    const response = await app.request("/api/users/current", {
      method: "GET",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.username).toBe("test");
  });
});
```

---

### Stage 4: Update User

**`src/validation/user-validation.ts`** (add `UPDATE`, all fields optional)

```typescript
static readonly UPDATE = z.object({
  password: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(100).optional(),
});
```

**`src/model/user-model.ts`** (add `UpdateUserRequest`)

```typescript
export type UpdateUserRequest = z.infer<typeof UserValidation.UPDATE>;
```

**`src/service/user-service.ts`** (add the `update` method)

```typescript
static async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
  request = UserValidation.UPDATE.parse(request);

  if (request.name) {
    user.name = request.name;
  }

  if (request.password) {
    user.password = await Bun.password.hash(request.password, { algorithm: "bcrypt", cost: 10 });
  }

  await prismaClient.user.update({
    where: { username: user.username },
    data: user,
  });

  return toUserResponse(user);
}
```

> **Gotcha:** `data: user` passes the **entire** mutated `user` object to Prisma, not just the changed fields. It happens to be safe here — `username`/`token` are re-written with their own unchanged values, and `name`/`password` are the only fields that actually change — but it's relying on that coincidence. An explicit `{ name: user.name, password: user.password }` would be safer against a surprise if `User` ever gains a new column that shouldn't be blindly round-tripped.

**`src/controller/user-controller.ts`** (add `update`)

```typescript
import { UpdateUserRequest } from "../model/user-model";

UserController.patch("/api/users/current", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as UpdateUserRequest;
  const response = await UserService.update(user, request);

  return c.json({ data: response });
});
```

**`src/test/user.test.ts`** (add `describe("PATCH /api/users/current")`)

```typescript
describe("PATCH /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should be able to update name", async () => {
    const response = await app.request("/api/users/current", {
      method: "PATCH",
      headers: { Authorization: "test" },
      body: JSON.stringify({ name: "new test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.name).toBe("new test");
  });

  it("should reject if token is null", async () => {
    const response = await app.request("/api/users/current", {
      method: "PATCH",
      body: JSON.stringify({ name: "new test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });
});
```

---

### Stage 5: Logout User

The final endpoint of User Management: clear the token so the user has to log in again to get a new one.

**`src/service/user-service.ts`** (add the `logout` method)

```typescript
static async logout(user: User): Promise<boolean> {
  await prismaClient.user.update({
    where: { username: user.username },
    data: { token: null },
  });

  return true;
}
```

**`src/controller/user-controller.ts`** (final — all User API routes)

```typescript
UserController.delete("/api/users/logout", async (c) => {
  const user = c.get("user") as User;
  await UserService.logout(user);

  return c.json("OK", 200);
});
```

> ⚠️ **Note:** Two small mismatches between [`doc/user.md`](doc/user.md) and the actual code, worth knowing if you go looking for either: the spec doc describes the endpoint as `DELETE /api/users/current`, but the route actually registered is `DELETE /api/users/logout` (the table above reflects the real route). And the spec doc shows a `{ "data": true }` response body, but the controller returns the bare JSON string `"OK"` — the test asserts `expect(body).toBe("OK")`, not `body.data`.

**`src/test/user.test.ts`** (add `describe("DELETE /api/users/logout")`)

```typescript
describe("DELETE /api/users/logout", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should be able to logout", async () => {
    const response = await app.request("/api/users/logout", {
      method: "DELETE",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toBe("OK");
  });

  it("should not be able to get user after logout", async () => {
    await app.request("/api/users/logout", {
      method: "DELETE",
      headers: { Authorization: "test" },
    });

    const response = await app.request("/api/users/current", {
      method: "GET",
      headers: { Authorization: "test" },
    });

    expect(response.status).toBe(401);
  });
});
```

With this, all of **User Management** is done: Register → Login → Get Current → Update → Logout.

---

## 📇 Part 2 — Contact Management

### Contact API Spec

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/contacts` | ✅ | Create a new contact |
| GET | `/api/contacts/:contactId` | ✅ | Get one contact's detail |
| PUT | `/api/contacts/:contactId` | ✅ | Update a contact |
| DELETE | `/api/contacts/:contactId` | ✅ | Delete a contact |
| GET | `/api/contacts` | ✅ | Search + pagination |

> Full request/response spec lives in [`doc/contact.md`](doc/contact.md).
>
> **Key Insight:** Every Contact route sits behind `contactController.use(authMiddleware)`, and every query always filters by `username: user.username`. This prevents user A from reading/modifying user B's contact even if they know the ID (Insecure Direct Object Reference).

---

### Stage 1: Create Contact

**`src/validation/contact-validation.ts`**

```typescript
import z from "zod";

export class ContactValidation {
  static readonly CREATE = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100).optional(),
    email: z.email().optional(),
    phone: z.string().min(1).max(20).optional(),
  });
}
```

**`src/model/contact-model.ts`**

```typescript
import z from "zod";
import { Contact } from "../generated/prisma";
import { ContactValidation } from "../validation/contact-validation";

export type CreateContactRequest = z.infer<typeof ContactValidation.CREATE>;

export type ContactResponse = {
  id: number;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function toContactResponse(contact: Contact): ContactResponse {
  return {
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone,
  };
}
```

**`src/service/contact-service.ts`**

```typescript
import { prismaClient } from "../application/database";
import { ContactResponse, CreateContactRequest, toContactResponse } from "../model/contact-model";
import { ContactValidation } from "../validation/contact-validation";
import { User } from "../generated/prisma";

export class ContactService {
  static async create(user: User, request: CreateContactRequest): Promise<ContactResponse> {
    request = ContactValidation.CREATE.parse(request);

    const data = { ...request, ...{ username: user.username } };

    const contact = await prismaClient.contact.create({ data });

    return toContactResponse(contact);
  }
}
```

- `username` is injected from the logged-in `user`, **not** from the request body — a client can't create a contact under another user's name.

**`src/controller/contact-controller.ts`**

```typescript
import { Hono } from "hono";
import { ApplicationVariables } from "../model/app-model";
import { authMiddleware } from "../middleware/auth-middlewate";
import { User } from "../generated/prisma";
import { CreateContactRequest } from "../model/contact-model";
import { ContactService } from "../service/contact-service";

export const contactController = new Hono<{ Variables: ApplicationVariables }>();

contactController.use(authMiddleware);

contactController.post("/api/contacts", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as CreateContactRequest;
  const response = await ContactService.create(user, request);

  return c.json({ data: response }, 200);
});
```

> **Tip:** Unlike `UserController`, `contactController.use(authMiddleware)` is registered **before every route on this instance** — all Contact routes are protected from the start, with no public/protected split needed within this module.

**`src/index.ts`** (mount `contactController`)

```typescript
import { contactController } from "./controller/contact-controller";
app.route("/", contactController);
```

**`src/test/test-util.ts`** (add `ContactTest`)

```typescript
export class ContactTest {
  static async create() {
    await prismaClient.contact.create({
      data: {
        username: "test",
        first_name: "hello",
        last_name: "world",
        email: "test@example.com",
        phone: "123456789",
      },
    });
  }

  static async get() {
    return await prismaClient.contact.findFirstOrThrow({ where: { username: "test" } });
  }

  static async deleteAll() {
    await prismaClient.contact.deleteMany({ where: { username: "test" } });
  }
}
```

**`src/test/contact.test.ts`**

```typescript
describe("POST /api/contacts", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should success if contact is valid (only first name)", async () => {
    const response = await app.request("/api/contacts", {
      method: "POST",
      headers: { Authorization: "test" },
      body: JSON.stringify({ first_name: "test" }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.first_name).toBe("test");
    expect(body.data.last_name).toBe(null);
  });
});
```

---

### Stage 2: Get Contact

This introduces `contactMustExists` — the `xMustExists` helper reused by every other Contact stage, and later by Address Management too.

**`src/validation/contact-validation.ts`** (add `GET`)

```typescript
static readonly GET = z.number().positive();
```

> **Key Insight:** Not every schema here is a `z.object` — `GET` (and `DELETE`, below) validates a bare `number` directly. Since a Zod schema is just a `ZodType`, `.parse()` works identically whether the shape underneath is an object or a primitive.

**`src/service/contact-service.ts`** (add `contactMustExists` + `get`)

```typescript
import { HTTPException } from "hono/http-exception";
import { Contact } from "../generated/prisma";

static async contactMustExists(user: User, contactId: number): Promise<Contact> {
  const contact = await prismaClient.contact.findFirst({
    where: { id: contactId, username: user.username },
  });

  if (!contact) {
    throw new HTTPException(404, { message: "Contact not found" });
  }

  return contact;
}

static async get(user: User, contactId: number): Promise<ContactResponse> {
  contactId = ContactValidation.GET.parse(contactId);
  const contact = await this.contactMustExists(user, contactId);
  return toContactResponse(contact);
}
```

**`src/controller/contact-controller.ts`** (add `get`)

```typescript
contactController.get("/api/contacts/:contactId", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const response = await ContactService.get(user, contactId);

  return c.json({ data: response }, 200);
});
```

**`src/test/contact.test.ts`** (add `describe("GET /api/contacts/:contactId")`)

```typescript
describe("GET /api/contacts/:contactId", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.create();
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should rejected if contact is not found", async () => {
    const response = await app.request("/api/contacts/99", {
      method: "GET",
      headers: { Authorization: "test" },
    });

    expect(response.status).toBe(404);
  });

  it("should success if contact is found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "GET",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.first_name).toBe(contact.first_name);
  });
});
```

---

### Stage 3: Update & Delete Contact

**`src/validation/contact-validation.ts`** (add `UPDATE`, `DELETE`)

```typescript
static readonly UPDATE = z.object({
  id: z.number().positive(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.email().optional(),
  phone: z.string().min(1).max(20).optional(),
});

static readonly DELETE = z.number().positive();
```

**`src/model/contact-model.ts`** (add `UpdateContactRequest`)

```typescript
export type UpdateContactRequest = z.infer<typeof ContactValidation.UPDATE>;
```

**`src/service/contact-service.ts`** (add `update`, `delete`)

```typescript
static async update(user: User, request: UpdateContactRequest): Promise<ContactResponse> {
  request = ContactValidation.UPDATE.parse(request);

  await this.contactMustExists(user, request.id);

  const contact = await prismaClient.contact.update({
    where: { id: request.id, username: user.username },
    data: request,
  });

  return toContactResponse(contact);
}

static async delete(user: User, contactId: number): Promise<boolean> {
  contactId = ContactValidation.DELETE.parse(contactId);

  await this.contactMustExists(user, contactId);

  await prismaClient.contact.delete({
    where: { id: contactId, username: user.username },
  });

  return true;
}
```

**`src/controller/contact-controller.ts`** (add `update`, `delete`)

```typescript
contactController.put("/api/contacts/:contactId", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const request = (await c.req.json()) as UpdateContactRequest;
  request.id = contactId;

  const response = await ContactService.update(user, request);
  return c.json({ data: response }, 200);
});

contactController.delete("/api/contacts/:contactId", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const response = await ContactService.delete(user, contactId);

  return c.json({ data: response }, 200);
});
```

**`src/test/contact.test.ts`** (add `describe("PUT ...")` and `describe("DELETE ...")`)

```typescript
describe("DELETE /api/contacts/:contactId", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.create();
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should success if contact is found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "DELETE",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
  });
});
```

---

### Stage 4: Search Contact

The most complex feature: dynamic filters (`name`, `email`, `phone` — all optional) plus pagination.

**`src/model/page-model.ts`**

```typescript
export type Paging = {
  page: number;
  size: number;
  total_pages: number;
};

export type Pageable<T> = {
  data: Array<T>;
  paging: Paging;
};
```

**`src/validation/contact-validation.ts`** (add `SEARCH`)

```typescript
static readonly SEARCH = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  email: z.email().optional(),
  page: z.number().min(1).max(100),
  size: z.number().min(1).max(100),
});
```

> **Note:** Unlike a schema with `.default(1)` built in, `page`/`size` here are **required** by the schema — the default (`"1"`/`"10"`) is instead supplied one layer up, in the controller, before the request object ever reaches `.parse()`.

**`src/service/contact-service.ts`** (add `search`)

```typescript
import { Pageable } from "../model/page-model";

static async search(user: User, request: SearchContactRequest): Promise<Pageable<ContactResponse>> {
  request = ContactValidation.SEARCH.parse(request);

  const filters = [];

  if (request.name) {
    filters.push({
      OR: [
        { first_name: { contains: request.name } },
        { last_name: { contains: request.name } },
      ],
    });
  }

  if (request.email) {
    filters.push({ email: { contains: request.email } });
  }

  if (request.phone) {
    filters.push({ phone: { contains: request.phone } });
  }

  const skip = (request.page - 1) * request.size;

  const contacts = await prismaClient.contact.findMany({
    where: { username: user.username, AND: filters },
    take: request.size,
    skip,
  });

  const total = await prismaClient.contact.count({
    where: { username: user.username, AND: filters },
  });

  return {
    data: contacts.map((contact) => toContactResponse(contact)),
    paging: {
      page: request.page,
      size: request.size,
      total_pages: Math.ceil(total / request.size),
    },
  };
}
```

> **Key Insight:** Filters are built as an **array of conditions** that only gets populated when the matching query param is present, then combined with `AND: filters` — the same pattern as most search endpoints in this style of project. `username: user.username` sits outside that array, directly on the top-level `where`, so search can never leak another user's contacts regardless of which filters are active.

**`src/controller/contact-controller.ts`** (add `search`, final — all Contact routes)

```typescript
import { SearchContactRequest } from "../model/contact-model";

contactController.get("/api/contacts", async (c) => {
  const user = c.get("user") as User;
  const request: SearchContactRequest = {
    name: c.req.query("name"),
    phone: c.req.query("phone"),
    email: c.req.query("email"),
    page: parseInt(c.req.query("page") || "1"),
    size: parseInt(c.req.query("size") || "10"),
  };

  const response = await ContactService.search(user, request);
  return c.json(response, 200);
});
```

> **Note:** [`doc/contact.md`](doc/contact.md) shows the search response's `paging` object as `{ "page", "size", "total" }`, but the actual field is named `total_pages` (matching `page-model.ts`) — the code is what the tests exercise, so trust the field name here over the spec doc.

**`src/test/contact.test.ts`** (add `describe("GET /api/contacts")`)

```typescript
describe("GET /api/contacts", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.createMany(20);
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should be able to search with pagination", async () => {
    const response = await app.request("/api/contacts", {
      method: "GET",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.length).toBe(10);
    expect(body.paging.total_pages).toBe(2);
  });

  it("should be able to search with paging", async () => {
    const response = await app.request("/api/contacts?page=2&size=5", {
      method: "GET",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.length).toBe(5);
    expect(body.paging.page).toBe(2);
  });
});
```

Contact Management is done: Create → Get → Update/Delete → Search.

---

## 🏠 Part 3 — Address Management

### Address API Spec

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/contacts/:contactId/addresses` | ✅ | Create a new address for a contact |
| GET | `/api/contacts/:contactId/addresses/:addressId` | ✅ | Get one address' detail |
| PUT | `/api/contacts/:contactId/addresses/:addressId` | ✅ | Update an address |
| DELETE | `/api/contacts/:contactId/addresses/:addressId` | ✅ | Delete an address |
| GET | `/api/contacts/:contactId/addresses` | ✅ | List all addresses of a contact |

> Full request/response spec lives in [`doc/address.md`](doc/address.md).
>
> **Key Insight:** An address is always accessed **through its contact** — the URL is always shaped like `/api/contacts/:contactId/addresses/...`. This reinforces the `User → Contact → Address` chain: `addressMustExists` checks the contact first, then the address.
>
> ⚠️ **Worth double-checking:** Unlike `UserController` and `contactController`, `addressController` in the current source never calls `.use(authMiddleware)`. Since each domain is its own `Hono` instance, middleware registered on `contactController` doesn't carry over to `addressController` when both are mounted with `app.route("/", ...)` in `index.ts` — a request would need `addressController.use(authMiddleware);` of its own to get the same protection. Worth adding for consistency with the other two modules, even though `addressMustExists` still checks contact **ownership** once `user` is available.

---

### Stage 1: Create Address

**`src/validation/address-validation.ts`**

```typescript
import { z } from "zod";

export class AddressValidation {
  static readonly CREATE = z.object({
    contact_id: z.number().int().positive(),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postal_code: z.string().min(1).max(10),
  });
}
```

**`src/model/address-model.ts`**

```typescript
import z from "zod";
import { Address } from "../generated/prisma";
import { AddressValidation } from "../validation/address-validation";

export type CreateAddressRequest = z.infer<typeof AddressValidation.CREATE>;

export type AddressResponse = {
  id: number;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  country: string;
  postal_code: string;
};

export function toAddressResponse(address: Address): AddressResponse {
  return {
    id: address.id,
    street: address.street,
    city: address.city,
    province: address.province,
    country: address.country,
    postal_code: address.postal_code,
  };
}
```

**`src/service/address-service.ts`**

```typescript
import { prismaClient } from "../application/database";
import { AddressResponse, CreateAddressRequest, toAddressResponse } from "../model/address-model";
import { AddressValidation } from "../validation/address-validation";
import { ContactService } from "./contact-service";
import { User } from "../generated/prisma";

export class AddressService {
  static async create(user: User, request: CreateAddressRequest): Promise<AddressResponse> {
    request = AddressValidation.CREATE.parse(request);
    await ContactService.contactMustExists(user, request.contact_id);

    const address = await prismaClient.address.create({ data: request });
    return toAddressResponse(address);
  }
}
```

- Before creating an address, `create` calls `ContactService.contactMustExists` — the same check used throughout Contact Management. If the contact doesn't belong to the logged-in `user`, the request is rejected with 404 before it ever touches the `address` table.

**`src/controller/address-controller.ts`**

```typescript
import { Hono } from "hono";
import { ApplicationVariables } from "../model/app-model";
import { User } from "../generated/prisma";
import { CreateAddressRequest } from "../model/address-model";
import { AddressService } from "../service/address-service";

export const addressController = new Hono<{ Variables: ApplicationVariables }>();

addressController.post("/api/contacts/:contactId/addresses", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const request = (await c.req.json()) as CreateAddressRequest;
  request.contact_id = contactId;

  const response = await AddressService.create(user, request);
  return c.json({ data: response }, 200);
});
```

- `contactId` comes from the **URL param**, not the body, then gets attached to `request.contact_id` before validation — consistent with the URL shape `/api/contacts/:contactId/addresses`.

**`src/index.ts`** (mount `addressController`, final — all controllers composed)

```typescript
import { addressController } from "./controller/address-controller";
app.route("/", addressController);
```

**`src/test/test-util.ts`** (add `AddressTest`)

```typescript
export class AddressTest {
  static async create() {
    const contact = await ContactTest.get();

    await prismaClient.address.create({
      data: {
        contact_id: contact.id,
        street: "Jl. Test",
        city: "Bandung",
        province: "Jawa Barat",
        country: "Indonesia",
        postal_code: "12345",
      },
    });
  }

  static async get() {
    return await prismaClient.address.findFirstOrThrow({
      where: { contact: { username: "test" } },
    });
  }

  static async deleteAll() {
    await prismaClient.address.deleteMany({
      where: { contact: { username: "test" } },
    });
  }
}
```

**`src/test/address.test.ts`**

```typescript
describe("POST /api/contacts/:contactId/addresses", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.create();
  });

  afterEach(async () => {
    await AddressTest.deleteAll();
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should success if address is valid", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}/addresses`, {
      method: "POST",
      headers: { Authorization: "test" },
      body: JSON.stringify({
        street: "Jl. Test",
        city: "Bandung",
        province: "Jawa Barat",
        country: "Indonesia",
        postal_code: "12345",
      }),
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.street).toBe("Jl. Test");
  });
});
```

---

### Stage 2: Get Address

**`src/validation/address-validation.ts`** (add `GET`)

```typescript
static readonly GET = z.object({
  contact_id: z.number().int().positive(),
  address_id: z.number().int().positive(),
});
```

**`src/model/address-model.ts`** (add `GetAddressRequest`)

```typescript
export type GetAddressRequest = z.infer<typeof AddressValidation.GET>;
```

**`src/service/address-service.ts`** (add `addressMustExists` + `get`)

```typescript
import { HTTPException } from "hono/http-exception";
import { GetAddressRequest } from "../model/address-model";

static async addressMustExists(user: User, contactId: number, addressId: number) {
  await ContactService.contactMustExists(user, contactId);

  const address = await prismaClient.address.findFirst({
    where: { id: addressId, contact_id: contactId, contact: { username: user.username } },
  });

  if (!address) {
    throw new HTTPException(404, { message: "Address not found" });
  }

  return address;
}

static async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
  request = AddressValidation.GET.parse(request);
  const address = await this.addressMustExists(user, request.contact_id, request.address_id);
  return toAddressResponse(address);
}
```

> **Key Insight:** `addressMustExists` calls `ContactService.contactMustExists` on the first line — if the contact alone isn't valid, it throws `404` immediately, before ever querying the `address` table. The follow-up query then filters by `id`, `contact_id`, **and** `contact.username` all at once — three separate mismatches (wrong address, wrong contact, wrong owner) collapse into the same 404.

**`src/controller/address-controller.ts`** (add `get`)

```typescript
import { GetAddressRequest } from "../model/address-model";

addressController.get("/api/contacts/:contactId/addresses/:addressId", async (c) => {
  const user = c.get("user") as User;
  const request: GetAddressRequest = {
    contact_id: parseInt(c.req.param("contactId")),
    address_id: parseInt(c.req.param("addressId")),
  };

  const response = await AddressService.get(user, request);
  return c.json({ data: response }, 200);
});
```

**`src/test/address.test.ts`** (add `describe("GET .../:addressId")`)

```typescript
describe("GET /api/contacts/:contactId/addresses/:addressId", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.create();
    await AddressTest.create();
  });

  afterEach(async () => {
    await AddressTest.deleteAll();
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should rejected if address is not found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}/addresses/99`, {
      method: "GET",
      headers: { Authorization: "test" },
    });

    expect(response.status).toBe(404);
  });

  it("should success if address is found", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();
    const response = await app.request(`/api/contacts/${contact.id}/addresses/${address.id}`, {
      method: "GET",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.street).toBe(address.street);
  });
});
```

---

### Stage 3: Update Address

**`src/validation/address-validation.ts`** (add `UPDATE`)

```typescript
static readonly UPDATE = z.object({
  contact_id: z.number().int().positive(),
  address_id: z.number().int().positive(),
  street: z.string().min(1).max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  province: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100),
  postal_code: z.string().min(1).max(10),
});
```

**`src/service/address-service.ts`** (add `update`)

```typescript
import { UpdateAddressRequest } from "../model/address-model";

static async update(user: User, request: UpdateAddressRequest): Promise<AddressResponse> {
  request = AddressValidation.UPDATE.parse(request);
  await this.addressMustExists(user, request.contact_id, request.address_id);

  const { address_id, contact_id, ...data } = request;

  const address = await prismaClient.address.update({
    where: { id: address_id, contact_id },
    data,
  });

  return toAddressResponse(address);
}
```

**`src/controller/address-controller.ts`** (add `update`)

```typescript
import { UpdateAddressRequest } from "../model/address-model";

addressController.put("/api/contacts/:contactId/addresses/:addressId", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as UpdateAddressRequest;
  request.contact_id = parseInt(c.req.param("contactId"));
  request.address_id = parseInt(c.req.param("addressId"));

  const response = await AddressService.update(user, request);
  return c.json({ data: response }, 200);
});
```

**`src/test/address.test.ts`** (add `describe("PUT .../:addressId")`)

```typescript
it("should success if address is found", async () => {
  const contact = await ContactTest.get();
  const address = await AddressTest.get();

  const response = await app.request(`/api/contacts/${contact.id}/addresses/${address.id}`, {
    method: "PUT",
    headers: { Authorization: "test" },
    body: JSON.stringify({
      street: "Jl. Test 2",
      city: "Jakarta",
      province: "DKI Jakarta",
      country: "Indonesia",
      postal_code: "54321",
    }),
  });

  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.data.street).toBe("Jl. Test 2");
});
```

---

### Stage 4: Remove Address

**`src/validation/address-validation.ts`** (add `DELETE`)

```typescript
static readonly DELETE = z.object({
  contact_id: z.number().int().positive(),
  address_id: z.number().int().positive(),
});
```

**`src/service/address-service.ts`** (add `remove`)

```typescript
import { RemoveAddressRequest } from "../model/address-model";

static async remove(user: User, request: RemoveAddressRequest): Promise<boolean> {
  request = AddressValidation.DELETE.parse(request);
  await this.addressMustExists(user, request.contact_id, request.address_id);

  await prismaClient.address.delete({
    where: { id: request.address_id, contact_id: request.contact_id },
  });

  return true;
}
```

**`src/controller/address-controller.ts`** (add `delete`)

```typescript
addressController.delete("/api/contacts/:contactId/addresses/:addressId", async (c) => {
  const user = c.get("user") as User;
  const request: RemoveAddressRequest = {
    contact_id: parseInt(c.req.param("contactId")),
    address_id: parseInt(c.req.param("addressId")),
  };

  const response = await AddressService.remove(user, request);
  return c.json({ data: response }, 200);
});
```

**`src/test/address.test.ts`** (add `describe("DELETE .../:addressId")`)

```typescript
it("should success if address is found", async () => {
  const contact = await ContactTest.get();
  const address = await AddressTest.get();

  const response = await app.request(`/api/contacts/${contact.id}/addresses/${address.id}`, {
    method: "DELETE",
    headers: { Authorization: "test" },
  });

  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.data).toBe(true);
});
```

---

### Stage 5: List Address

The final endpoint — `list` doesn't need `addressMustExists` (there's no specific address ID yet); it only confirms the contact is valid, then fetches every address underneath it.

**`src/validation/address-validation.ts`** (add `LIST`)

```typescript
static readonly LIST = z.object({
  contact_id: z.number().int().positive(),
});
```

**`src/service/address-service.ts`** (add `list`, final — all Address methods)

```typescript
import { ListAddressRequest } from "../model/address-model";

static async list(user: User, request: ListAddressRequest): Promise<AddressResponse[]> {
  request = AddressValidation.LIST.parse(request);
  await ContactService.contactMustExists(user, request.contact_id);

  const addresses = await prismaClient.address.findMany({
    where: { contact_id: request.contact_id, contact: { username: user.username } },
  });

  return addresses.map((address) => toAddressResponse(address));
}
```

**`src/controller/address-controller.ts`** (add `list`, final — all Address routes)

```typescript
import { ListAddressRequest } from "../model/address-model";

addressController.get("/api/contacts/:contactId/addresses", async (c) => {
  const user = c.get("user") as User;
  const request: ListAddressRequest = { contact_id: parseInt(c.req.param("contactId")) };

  const response = await AddressService.list(user, request);
  return c.json({ data: response }, 200);
});
```

**`src/test/address.test.ts`** (add `describe("GET .../addresses")`, final)

```typescript
describe("GET /api/contacts/:contactId/addresses", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.create();
    await AddressTest.create();
    await AddressTest.create();
  });

  afterEach(async () => {
    await AddressTest.deleteAll();
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("should success if contact is found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}/addresses`, {
      method: "GET",
      headers: { Authorization: "test" },
    });

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.length).toBe(2);
  });
});
```

With this, **Address Management** is done: Create → Get → Update → Remove → List — and the entire Contact Management RESTful API (User + Contact + Address) is complete.

---

## 🛠️ Running the Project

**`package.json`** (scripts)

```json
"scripts": {
  "dev": "bun run --hot src/index.ts",
  "build": "bun build src/index.ts --target=bun --outdir=dist",
  "binary": "bun build src/index.ts --compile --target=bun-linux-arm64 --outfile hono-restful-api"
}
```

| Script | Command | When to use it |
| --- | --- | --- |
| `bun run dev` | `bun run --hot src/index.ts` | Runs straight from source with hot reload — the command to use while actively developing a feature. |
| `bun run build` | `bun build src/index.ts --target=bun --outdir=dist` | Bundles the app into `dist/` for deployment as plain JS, still run by `bun`. |
| `bun run binary` | `bun build src/index.ts --compile --target=bun-linux-arm64 --outfile hono-restful-api` | Compiles a **standalone executable** with the Bun runtime baked in — this is what the Dockerfile below actually ships. |
| `bun test` | `bun test` | Runs the entire test suite (`user.test.ts`, `contact.test.ts`, `address.test.ts`) against the real MariaDB database via `UserTest`/`ContactTest`/`AddressTest`. |

**`Dockerfile`**

```dockerfile
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY hono-restful-api ./hono-restful-api

RUN chmod +x ./hono-restful-api

EXPOSE 3000

CMD ["./hono-restful-api"]
```

> **Key Insight:** The Dockerfile doesn't build anything itself — it just copies the binary produced by `bun run binary` into a slim Debian image and runs it directly. No Bun install, no `node_modules`, no source code in the final image at all; the entire runtime is baked into that one compiled file.

While testing this locally, a stale container was already bound to the port:

```text
dzarurizky@192 study-bun-hono-restful-api %   docker run -p 3000:3000 --env-file .env hono-restful-api
WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested
docker: Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint silly_clarke: Bind for 0.0.0.0:3000 failed: port is already allocated
```

> **Gotcha:** `docker run -p 3000:3000 ... hono-restful-api` fails with "port is already allocated" if a previous container from an earlier run is still bound to `3000` — stop it (`docker ps` then `docker stop <id>`) before retrying. Separately, the `--target=bun-linux-arm64` flag in the `binary` script only produces an `arm64` Linux binary, which is why the platform-mismatch warning shows up when the host reports a different architecture.

**Typical day-to-day flow:**

1. Changed `prisma/schema.prisma`? → `bunx prisma migrate dev --name <change>`
2. Working on a feature → `bun run dev` (hot reload on save)
3. Before committing → `bun test`
4. Want a deployable artifact → `bun run binary`, then build/run the Docker image

---

## 🧪 Manual Testing

After the automated suite (`bun test`) is green, `test.http` is the last verification step — booting the real server and hitting every endpoint by hand.

**`test.http`**

```http
### Register User
POST http://localhost:3001/api/users
Content-Type: application/json
Accept: application/json

{
    "username": "dzaru",
    "password": "dzaru2024",
    "name": "Dzaru Rizky Fathan Fortuna"
}

### Login User
POST http://localhost:3001/api/users/login
Content-Type: application/json
Accept: application/json

{
    "username": "dzaru",
    "password": "dzaru2025"
}

### Get Current User
GET http://localhost:3001/api/users/current
Authorization: fa8af6a8-59a1-4e7c-9153-e7942ee922ea

### Create Contact
POST http://localhost:3001/api/contacts
Content-Type: application/json
Authorization: fa8af6a8-59a1-4e7c-9153-e7942ee922ea

{
    "first_name": "Dzaru",
    "last_name": "Rizky",
    "email": "dzarurizky@example.com",
    "phone": "08123456789"
}

### Create Address
POST http://localhost:3001/api/contacts/2553/addresses
Content-Type: application/json
Authorization: fa8af6a8-59a1-4e7c-9153-e7942ee922ea

{
    "street": "Jl. Kemanggisan Utama Raya",
    "city": "Jakarta Barat",
    "province": "DKI Jakarta",
    "country": "Indonesia",
    "postal_code": "11540"
}
```

- This is the plain-text `.http` request format understood by editor plugins like VS Code's **REST Client** extension or JetBrains' built-in HTTP Client — each block starting with `###` is one independent, runnable request.
- Every request here sends the token as a bare `Authorization: <token>` header — no `Bearer` prefix, matching `authMiddleware`'s `c.req.header("Authorization")` read.

> ⚠️ **Note:** The token (`fa8af6a8-...`) and the contact/address IDs (`2553`, `158`, etc.) baked into `test.http` are just a snapshot from one past manual run — refresh them from your own Register/Login/Create responses before reusing this file. Also note the file targets `http://localhost:3001`, while `bun run dev` serves on Bun's default port `3000` unless the port is overridden — adjust to match whichever port your server actually boots on.

---

## 📚 Quick Reference

### All Endpoints

| Module | Method | Endpoint | Auth |
| --- | --- | --- | --- |
| User | POST | `/api/users` | - |
| User | POST | `/api/users/login` | - |
| User | GET | `/api/users/current` | ✅ |
| User | PATCH | `/api/users/current` | ✅ |
| User | DELETE | `/api/users/logout` | ✅ |
| Contact | POST | `/api/contacts` | ✅ |
| Contact | GET | `/api/contacts/:contactId` | ✅ |
| Contact | PUT | `/api/contacts/:contactId` | ✅ |
| Contact | DELETE | `/api/contacts/:contactId` | ✅ |
| Contact | GET | `/api/contacts` (search) | ✅ |
| Address | POST | `/api/contacts/:contactId/addresses` | ⚠️ not enforced in code |
| Address | GET | `/api/contacts/:contactId/addresses/:addressId` | ⚠️ not enforced in code |
| Address | PUT | `/api/contacts/:contactId/addresses/:addressId` | ⚠️ not enforced in code |
| Address | DELETE | `/api/contacts/:contactId/addresses/:addressId` | ⚠️ not enforced in code |
| Address | GET | `/api/contacts/:contactId/addresses` (list) | ⚠️ not enforced in code |

### Folder Structure

```text
src/
├── application/     # database.ts (Prisma + MariaDB adapter), logging.ts (Winston)
├── controller/      # one Hono instance per domain — router + handler in the same file
├── middleware/      # auth-middlewate.ts
├── model/           # DTO types (via z.infer<typeof Schema>) + toXResponse mapper
├── service/         # business logic + xMustExists ownership-check helpers
├── validation/       # Zod schema per feature — the source of both types and runtime checks
├── test/             # test-util.ts (XTest.create/get/deleteAll) + *.test.ts
└── index.ts          # composes every controller + centralized onError
```

---

## 💡 Key Takeaways

- **Layered architecture, one file fewer per layer**: `controller → service → prisma`, with no separate `route/`, `type/`, or `error/` folders — each controller file *is* its domain's router, and `HTTPException` is thrown directly rather than through a custom error class.
- **The `xMustExists` pattern**: `contactMustExists` and `addressMustExists` each query by ID **and** filter by ownership at the same time, throwing `404` when nothing matches — the single place data authorization happens per module.
- **Schema-derived types**: every request type is `z.infer<typeof SomeValidation.SCHEMA>` instead of a hand-written interface — one definition drives both the compile-time type and the runtime check.
- **Bun's standard library instead of npm packages**: `Bun.password.hash`/`verify` replaces `bcrypt`, and the global `crypto.randomUUID()` replaces the `uuid` package — one less dependency for each.
- **Centralized error handling via `app.onError`**: `HTTPException` → its own status, `ZodError` → 400, anything else → 500. Services/controllers just `throw`.
- **Auth is a raw `Authorization` header**, not a `Bearer` scheme or JWT — the token is a plain column on `user`, matched directly by `authMiddleware`. Simple for learning purposes; a production system would likely add expiry via JWT or a session store.
- **Consistency across per-domain routers is easy to lose**: `UserController` and `contactController` both call `.use(authMiddleware)`, but `addressController` doesn't — a good example of how splitting routing into one `Hono` instance per domain means auth has to be *repeated* deliberately on every instance, since there's no single shared middleware chain enforcing it automatically.
