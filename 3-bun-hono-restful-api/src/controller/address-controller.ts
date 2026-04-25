import { Hono } from "hono";
import { ApplicationVariables } from "../model/app-model";
import { User } from "../generated/prisma";
import {
  CreateAddressRequest,
  GetAddressRequest,
  ListAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from "../model/address-model";
import { AddressService } from "../service/address-service";

export const addressController = new Hono<{
  Variables: ApplicationVariables;
}>();

addressController.post("/api/contacts/:contactId/addresses", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const request = (await c.req.json()) as CreateAddressRequest;
  request.contact_id = contactId;
  const response = await AddressService.create(user, request);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

addressController.get(
  "/api/contacts/:contactId/addresses/:addressId",
  async (c) => {
    const user = c.get("user") as User;
    const contactId = parseInt(c.req.param("contactId"));
    const addressId = parseInt(c.req.param("addressId"));

    const request: GetAddressRequest = {
      contact_id: contactId,
      address_id: addressId,
    };

    const response = await AddressService.get(user, request);

    return c.json(
      {
        data: response,
      },
      200,
    );
  },
);

addressController.put(
  "/api/contacts/:contactId/addresses/:addressId",
  async (c) => {
    const user = c.get("user") as User;
    const contactId = parseInt(c.req.param("contactId"));
    const addressId = parseInt(c.req.param("addressId"));

    const request = (await c.req.json()) as UpdateAddressRequest;
    request.contact_id = contactId;
    request.address_id = addressId;

    const response = await AddressService.update(user, request);
    return c.json(
      {
        data: response,
      },
      200,
    );
  },
);

addressController.delete(
  "/api/contacts/:contactId/addresses/:addressId",
  async (c) => {
    const user = c.get("user") as User;
    const contactId = parseInt(c.req.param("contactId"));
    const addressId = parseInt(c.req.param("addressId"));

    const request: RemoveAddressRequest = {
      contact_id: contactId,
      address_id: addressId,
    };

    const response = await AddressService.remove(user, request);
    return c.json(
      {
        data: response,
      },
      200,
    );
  },
);

addressController.get("/api/contacts/:contactId/addresses", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const request: ListAddressRequest = {
    contact_id: contactId,
  };
  const response = await AddressService.list(user, request);

  return c.json(
    {
      data: response,
    },
    200,
  );
});
