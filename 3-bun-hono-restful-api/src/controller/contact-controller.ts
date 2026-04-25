import { Hono } from "hono";
import { ApplicationVariables } from "../model/app-model";
import { authMiddleware } from "../middleware/auth-middlewate";
import { User } from "../generated/prisma";
import {
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from "../model/contact-model";
import { ContactService } from "../service/contact-service";

export const contactController = new Hono<{
  Variables: ApplicationVariables;
}>();

contactController.use(authMiddleware);

contactController.post("/api/contacts", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as CreateContactRequest;
  const response = await ContactService.create(user, request);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

contactController.get("/api/contacts/:contactId", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const response = await ContactService.get(user, contactId);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

contactController.put("/api/contacts/:contactId", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const request = (await c.req.json()) as UpdateContactRequest;
  request.id = contactId;

  const response = await ContactService.update(user, request);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

contactController.delete("/api/contacts/:contactId", async (c) => {
  const user = c.get("user") as User;
  const contactId = parseInt(c.req.param("contactId"));
  const response = await ContactService.delete(user, contactId);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

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
