import z from "zod";
import { User } from "../generated/prisma";
import { UserValidation } from "../validation/user-validation";

export type RegisterUserRequest = z.infer<typeof UserValidation.REGISTER>;
export type LoginUserRequest = z.infer<typeof UserValidation.LOGIN>;
export type UpdateUserRequest = z.infer<typeof UserValidation.UPDATE>;

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
