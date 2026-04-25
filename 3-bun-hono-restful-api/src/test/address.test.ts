import app from "../index";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { AddressTest, ContactTest, UserTest } from "./test-util";
import { logger } from "../application/logging";

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

  it("should rejected if token is not valid", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses`,
      {
        method: "POST",
        headers: {
          Authorization: "wrong",
        },
        body: JSON.stringify({
          street: "test",
          city: "test",
          province: "test",
          country: "test",
          postal_code: "test",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is not found", async () => {
    const response = await app.request(`/api/contacts/99/addresses`, {
      method: "POST",
      headers: {
        Authorization: "test",
      },
      body: JSON.stringify({
        street: "test",
        city: "test",
        province: "test",
        country: "test",
        postal_code: "test",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if address is invalid", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses`,
      {
        method: "POST",
        headers: {
          Authorization: "test",
        },
        body: JSON.stringify({
          street: "",
          city: "",
          province: "",
          country: "",
          postal_code: "",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should success if address is valid", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses`,
      {
        method: "POST",
        headers: {
          Authorization: "test",
        },
        body: JSON.stringify({
          street: "Jl. Test",
          city: "Bandung",
          province: "Jawa Barat",
          country: "Indonesia",
          postal_code: "12345",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.street).toBe("Jl. Test");
    expect(body.data.city).toBe("Bandung");
    expect(body.data.province).toBe("Jawa Barat");
    expect(body.data.country).toBe("Indonesia");
    expect(body.data.postal_code).toBe("12345");
  });
});

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

  it("should rejected if token is not valid", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "GET",
        headers: {
          Authorization: "wrong",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is not found", async () => {
    const response = await app.request(`/api/contacts/99/addresses/99`, {
      method: "GET",
      headers: {
        Authorization: "test",
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if address is not found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/99`,
      {
        method: "GET",
        headers: {
          Authorization: "test",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should success if address is found", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();

    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "GET",
        headers: {
          Authorization: "test",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.street).toBe(address.street);
    expect(body.data.city).toBe(address.city);
    expect(body.data.province).toBe(address.province);
    expect(body.data.country).toBe(address.country);
    expect(body.data.postal_code).toBe(address.postal_code);
  });
});

describe("PUT /api/contacts/:contactId/addresses/:addressId", () => {
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

  it("should rejected if token is not valid", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: "wrong",
        },
        body: JSON.stringify({
          street: "Jl. Test",
          city: "Bandung",
          province: "Jawa Barat",
          country: "Indonesia",
          postal_code: "12345",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is not found", async () => {
    const response = await app.request(`/api/contacts/99/addresses/99`, {
      method: "PUT",
      headers: {
        Authorization: "test",
      },
      body: JSON.stringify({
        street: "Jl. Test",
        city: "Bandung",
        province: "Jawa Barat",
        country: "Indonesia",
        postal_code: "12345",
      }),
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if address is not found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/99`,
      {
        method: "PUT",
        headers: {
          Authorization: "test",
        },
        body: JSON.stringify({
          street: "Jl. Test",
          city: "Bandung",
          province: "Jawa Barat",
          country: "Indonesia",
          postal_code: "12345",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if address is invalid", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: "test",
        },
        body: JSON.stringify({
          street: "",
          city: "",
          province: "",
          country: "",
          postal_code: "",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(400);
    expect(body.errors).toBeDefined();
  });

  it("should success if address is found", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();

    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: "test",
        },
        body: JSON.stringify({
          street: "Jl. Test 2",
          city: "Jakarta",
          province: "DKI Jakarta",
          country: "Indonesia",
          postal_code: "54321",
        }),
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.street).toBe("Jl. Test 2");
    expect(body.data.city).toBe("Jakarta");
    expect(body.data.province).toBe("DKI Jakarta");
    expect(body.data.country).toBe("Indonesia");
    expect(body.data.postal_code).toBe("54321");
  });
});

describe("DELETE /api/contacts/:contactId/addresses/:addressId", () => {
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

  it("should rejected if token is not valid", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "wrong",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is not found", async () => {
    const response = await app.request(`/api/contacts/99/addresses/99`, {
      method: "DELETE",
      headers: {
        Authorization: "test",
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if address is not found", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/99`,
      {
        method: "DELETE",
        headers: {
          Authorization: "test",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should success if address is found", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();

    const response = await app.request(
      `/api/contacts/${contact.id}/addresses/${address.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "test",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBe(true);
  });
});

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

  it("should rejected if token is not valid", async () => {
    const contact = await ContactTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses`,
      {
        method: "GET",
        headers: {
          Authorization: "wrong",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(401);
    expect(body.errors).toBeDefined();
  });

  it("should rejected if contact is not found", async () => {
    const response = await app.request(`/api/contacts/99/addresses`, {
      method: "GET",
      headers: {
        Authorization: "test",
      },
    });

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(404);
    expect(body.errors).toBeDefined();
  });

  it("should success if contact is found", async () => {
    const contact = await ContactTest.get();
    const address = await AddressTest.get();
    const response = await app.request(
      `/api/contacts/${contact.id}/addresses`,
      {
        method: "GET",
        headers: {
          Authorization: "test",
        },
      },
    );

    const body = await response.json();
    logger.debug(body);

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.length).toBe(2);
    expect(body.data[0].street).toBe(address.street);
    expect(body.data[0].city).toBe(address.city);
    expect(body.data[0].province).toBe(address.province);
    expect(body.data[0].country).toBe(address.country);
    expect(body.data[0].postal_code).toBe(address.postal_code);
  });
});
