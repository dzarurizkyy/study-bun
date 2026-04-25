import z from "zod";
import { Address } from "../generated/prisma";
import { AddressValidation } from "../validation/address-validation";

export type AddressResponse = {
  id: number;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  country: string;
  postal_code: string;
};

export type CreateAddressRequest = z.infer<typeof AddressValidation.CREATE>;
export type GetAddressRequest = z.infer<typeof AddressValidation.GET>;
export type UpdateAddressRequest = z.infer<typeof AddressValidation.UPDATE>;
export type RemoveAddressRequest = z.infer<typeof AddressValidation.DELETE>;
export type ListAddressRequest = z.infer<typeof AddressValidation.LIST>;

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
