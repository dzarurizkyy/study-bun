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

  static readonly GET = z.object({
    contact_id: z.number().int().positive(),
    address_id: z.number().int().positive(),
  });

  static readonly UPDATE = z.object({
    contact_id: z.number().int().positive(),
    address_id: z.number().int().positive(),
    street: z.string().min(1).max(255).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postal_code: z.string().min(1).max(10),
  });

  static readonly DELETE = z.object({
    contact_id: z.number().int().positive(),
    address_id: z.number().int().positive(),
  });

  static readonly LIST = z.object({
    contact_id: z.number().int().positive(),
  });
}