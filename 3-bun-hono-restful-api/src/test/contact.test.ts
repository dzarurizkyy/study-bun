import app from "../index";
import { logger } from "../application/logging";
import { expect, describe, beforeEach, afterEach, it } from "bun:test";
import { ContactTest, UserTest } from "./test-util";

describe("POST /api/contacts", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("shoud rejected if token is not valid", async () => {
    const token = "wrong";
    const response = await app.request("/api/contacts", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is invalid", async () => {
    const token = "test";
    const response = await app.request("/api/contacts", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should success if contact is valid (only first name)", async () => {
    const token = "test";
    const response = await app.request("/api/contacts", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.first_name).toBe("test");
    expect(body.data.last_name).toBe(null);
    expect(body.data.email).toBe(null);
    expect(body.data.phone).toBe(null);
  });

  it("should success if contact is valid", async () => {
    const token = "test";
    const response = await app.request("/api/contacts", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "test",
        last_name: "test",
        email: "test@example.com",
        phone: "123456789",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.first_name).toBe("test");
    expect(body.data.last_name).toBe("test");
    expect(body.data.email).toBe("test@example.com");
    expect(body.data.phone).toBe("123456789");
  });
});

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

  it("shoud rejected if token is not valid", async () => {
    const token = "wrong";
    const response = await app.request("/api/contacts/1", {
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

  it("should rejected if contact is not found", async () => {
    const token = "test";
    const response = await app.request("/api/contacts/99", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should success if contact is found", async () => {
    const token = "test";
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.first_name).toBe(contact.first_name);
    expect(body.data.last_name).toBe(contact.last_name);
    expect(body.data.email).toBe(contact.email);
    expect(body.data.phone).toBe(contact.phone);
  });
});

describe("PUT /api/contacts/:contactId", () => {
  beforeEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.create();
    await ContactTest.create();
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  it("shoud rejected if token is not valid", async () => {
    const token = "wrong";
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is invalid", async () => {
    const token = "test";
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is not found", async () => {
    const token = "test";
    const response = await app.request("/api/contacts/99", {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should success if contact is found", async () => {
    const token = "test";
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        first_name: "new test",
        last_name: "new test",
        email: "newtest@example.com",
        phone: "123456789",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.first_name).toBe("new test");
    expect(body.data.last_name).toBe("new test");
    expect(body.data.email).toBe("newtest@example.com");
    expect(body.data.phone).toBe("123456789");
  });
});

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

  it("shoud rejected if token is not valid", async () => {
    const token = "wrong";
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
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

  it("should rejected if contact is not found", async () => {
    const token = "test";
    const response = await app.request("/api/contacts/99", {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should success if contact is found", async () => {
    const token = "test";
    const contact = await ContactTest.get();
    const response = await app.request(`/api/contacts/${contact.id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
  });
});

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

  it("should rejected if token is not valid", async () => {
    const token = "wrong";
    const response = await app.request("/api/contacts", {
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

  it("should be able to search with pagination", async () => {
    const token = "test";
    const response = await app.request("/api/contacts", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(10);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(2);
  });

  it("should success with search by name", async () => {
    const token = "test";
    let response = await app.request("/api/contacts?name=hello", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    let body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(10);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(2);

    response = await app.request("/api/contacts?name=world", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(10);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(2);
  });

  it("should be able to search by phone", async () => {
    const token = "test";
    const response = await app.request("/api/contacts?phone=123456789", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(10);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(2);
  });

  it("should be able to search by email", async () => {
    const token = "test";
    const response = await app.request("/api/contacts?email=test@example.com", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(10);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(2);
  });

  it("should be able to search with paging", async () => {
    const token = "test";
    let response = await app.request("/api/contacts?page=2&size=5", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    let body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(5);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(2);
    expect(body.paging.size).toBe(5);
    expect(body.paging.total_pages).toBe(4);

    response = await app.request("/api/contacts?page=100&size=5", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(0);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(100);
    expect(body.paging.size).toBe(5);
    expect(body.paging.total_pages).toBe(4);
  });

  it("should be able to search with all fields", async () => {
    const token = "test";
    const response = await app.request(
      "/api/contacts?name=hello&phone=123456789&email=test@example.com",
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(10);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(2);
  });

  it("should be able to search without result", async () => {
    const token = "test";
    const response = await app.request("/api/contacts?name=wrong", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(0);
    expect(body.paging).toBeDefined();
    expect(body.paging.page).toBe(1);
    expect(body.paging.size).toBe(10);
    expect(body.paging.total_pages).toBe(0);
  });
});
