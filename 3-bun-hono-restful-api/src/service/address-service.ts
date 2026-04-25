import { HTTPException } from "hono/http-exception";
import { prismaClient } from "../application/database";
import { User } from "../generated/prisma";
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  ListAddressRequest,
  RemoveAddressRequest,
  toAddressResponse,
  UpdateAddressRequest,
} from "../model/address-model";
import { AddressValidation } from "../validation/address-validation";
import { ContactService } from "./contact-service";

export class AddressService {
  static async addressMustExists(
    user: User,
    contactId: number,
    addressId: number,
  ) {
    await ContactService.contactMustExists(user, contactId);
    const address = await prismaClient.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
        contact: {
          username: user.username,
        },
      },
    });
    if (!address) {
      throw new HTTPException(404, { message: "Address not found" });
    }
    return address;
  }

  static async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    request = AddressValidation.CREATE.parse(request);
    await ContactService.contactMustExists(user, request.contact_id);
    const address = await prismaClient.address.create({ data: request });
    return toAddressResponse(address);
  }

  static async get(
    user: User,
    request: GetAddressRequest,
  ): Promise<AddressResponse> {
    request = AddressValidation.GET.parse(request);
    const address = await this.addressMustExists(
      user,
      request.contact_id,
      request.address_id,
    );
    return toAddressResponse(address);
  }

  static async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    request = AddressValidation.UPDATE.parse(request);
    await this.addressMustExists(user, request.contact_id, request.address_id);

    const { address_id, contact_id, ...data } = request;

    const address = await prismaClient.address.update({
      where: {
        id: address_id,
        contact_id: contact_id,
      },
      data: data,
    });
    return toAddressResponse(address);
  }

  static async remove(
    user: User,
    request: RemoveAddressRequest,
  ): Promise<boolean> {
    request = AddressValidation.DELETE.parse(request);
    await this.addressMustExists(user, request.contact_id, request.address_id);
    await prismaClient.address.delete({
      where: {
        id: request.address_id,
        contact_id: request.contact_id,
      },
    });
    return true;
  }

  static async list(
    user: User,
    request: ListAddressRequest,
  ): Promise<AddressResponse[]> {
    request = AddressValidation.LIST.parse(request);
    await ContactService.contactMustExists(user, request.contact_id);

    const addresses = await prismaClient.address.findMany({
      where: {
        contact_id: request.contact_id,
        contact: {
          username: user.username,
        },
      },
    });

    return addresses.map((address) => toAddressResponse(address));
  }
}
