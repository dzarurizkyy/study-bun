import app from "../index";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { logger } from "../application/logging";
import { UserTest } from "./test-util";

describe("POST /api/users", () => {
  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject register new user if request is invalid", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "",
        password: "",
        name: "",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should reject register new user if username already exists", async () => {
    await UserTest.create();

    const response = await app.request("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "test",
        password: "test",
        name: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should register new user success", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "test",
        password: "test",
        name: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.name).toBe("test");
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject login if request is invalid", async () => {
    const response = await app.request("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "",
        password: "",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should be rejected if username is wrong", async () => {
    const response = await app.request("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "wrong",
        password: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should reject login if password is not valid", async () => {
    const response = await app.request("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "test",
        password: "wrong",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should be able to login", async () => {
    const response = await app.request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({
        username: "test",
        password: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.token).toBeDefined();
  });
});

describe("GET /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should not be able to get user if there is no Authorization Header", async () => {
    const response = await app.request("/api/users/current", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("shout not be able to get user if token is invalid", async () => {
    const response = await app.request("/api/users/current", {
      method: "GET",
      headers: {
        Authorization: "salah",
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should be able to get current user", async () => {
    const token = "test";
    const response = await app.request("/api/users/current", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.name).toBe("test");
  });
});

describe("PATCH /api/users/current", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject if request is invalid", async () => {
    const token = "test";
    const response = await app.request("/api/users/current", {
      method: "PATCH",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        name: "",
        password: "",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should be able to update name", async () => {
    const token = "test";
    const response = await app.request("/api/users/current", {
      method: "PATCH",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        name: "new test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.name).toBe("new test");
  });

  it("should be able to update password", async () => {
    const token = "test";
    const password = "new password";

    let response = await app.request("/api/users/current", {
      method: "PATCH",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        password: password,
      }),
    });

    let body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");

    response = await app.request("/api/users/login", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        username: "test",
        password: password,
      }),
    });

    body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.token).not.toBe(token);
  });

  it("should be able to update name and password", async () => {
    const token = "test";
    let response = await app.request("/api/users/current", {
      method: "PATCH",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        name: "new test",
        password: "new password",
      }),
    });

    let body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.name).toBe("new test");

    response = await app.request("/api/users/login", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        username: "test",
        password: "new password",
      }),
    });

    body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.username).toBe("test");
    expect(body.data.token).not.toBe(token);
  });

  it("should reject if token is invalid", async () => {
    const token = "invalid";
    const response = await app.request("/api/users/current", {
      method: "PATCH",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        name: "new test",
        password: "new password",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should reject if token is null", async () => {
    const response = await app.request("/api/users/current", {
      method: "PATCH",
      body: JSON.stringify({
        name: "new test",
        password: "new password",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });
});

describe("DELETE /api/users/logout", () => {
  beforeEach(async () => {
    await UserTest.create();
  });

  afterEach(async () => {
    await UserTest.delete();
  });

  it("should reject if token is null", async () => {
    const response = await app.request("/api/users/logout", {
      method: "DELETE",
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should reject if token is invalid", async () => {
    const token = "invalid";
    const response = await app.request("/api/users/logout", {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should be able to logout", async () => {
    const token = "test";
    const response = await app.request("/api/users/logout", {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body).toBe("OK");
  });

  it("should not be able to get user after logout", async () => {
    const token = "test";
    await app.request("/api/users/logout", {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const response = await app.request("/api/users/current", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });
});
