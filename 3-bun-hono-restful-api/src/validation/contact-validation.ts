import z from "zod";

export class ContactValidation {
  static readonly CREATE = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100).optional(),
    email: z.email().optional(),
    phone: z.string().min(1).max(20).optional(),
  });

  static readonly UPDATE = z.object({
    id: z.number().positive(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    email: z.email().optional(),
    phone: z.string().min(1).max(20).optional(),
  });

  static readonly SEARCH = z.object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(20).optional(),
    email: z.email().optional(),
    page: z.number().min(1).max(100),
    size: z.number().min(1).max(100),
  });

  static readonly GET = z.number().positive();
  static readonly DELETE = z.number().positive();
}
