import { Hono } from "hono";
import { User } from "../generated/prisma";
import { UserService } from "../service/user-service";
import { ApplicationVariables } from "../model/app-model";
import {
  LoginUserRequest,
  RegisterUserRequest,
  toUserResponse,
  UpdateUserRequest,
} from "../model/user-model";
import { authMiddleware } from "../middleware/auth-middlewate";

export const UserController = new Hono<{ Variables: ApplicationVariables }>();

UserController.post("/api/users", async (c) => {
  const request = (await c.req.json()) as RegisterUserRequest;
  const response = await UserService.register(request);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

UserController.post("/api/users/login", async (c) => {
  const request = (await c.req.json()) as LoginUserRequest;
  const response = await UserService.login(request);

  return c.json(
    {
      data: response,
    },
    200,
  );
});

UserController.use(authMiddleware);

UserController.get("/api/users/current", async (c) => {
  const user = c.get("user") as User;

  return c.json({
    data: toUserResponse(user),
  });
});

UserController.patch("/api/users/current", async (c) => {
  const user = c.get("user") as User;
  const request = (await c.req.json()) as UpdateUserRequest;
  const response = await UserService.update(user, request);

  return c.json({
    data: response,
  });
});

UserController.delete("/api/users/logout", async (c) => {
  const user = c.get("user") as User;
  await UserService.logout(user);

  return c.json("OK", 200);
});
