import { prismaClient } from "../application/database";

export class UserTest {
  static async create() {
    await prismaClient.user.create({
      data: {
        username: "test",
        name: "test",
        password: await Bun.password.hash("test", {
          algorithm: "bcrypt",
          cost: 10,
        }),
        token: "test",
      },
    });
  }

  static async delete() {
    await prismaClient.user.deleteMany({
      where: {
        username: "test",
      },
    });
  }
}

export class ContactTest {
  static async create() {
    await prismaClient.contact.create({
      data: {
        username: "test",
        first_name: "hello",
        last_name: "world",
        email: "test@example.com",
        phone: "123456789",
      },
    });
  }

  static async createMany(count: number) {
    for (let i = 1; i <= count; i++) {
      await this.create();
    }
  }

  static async get() {
    return await prismaClient.contact.findFirstOrThrow({
      where: {
        username: "test",
      },
    });
  }

  static async deleteAll() {
    await prismaClient.contact.deleteMany({
      where: {
        username: "test",
      },
    });
  }
}

export class AddressTest {
  static async create() {
    const contact = await ContactTest.get();

    await prismaClient.address.create({
      data: {
        contact_id: contact.id,
        street: "Jl. Test",
        city: "Bandung",
        province: "Jawa Barat",
        country: "Indonesia",
        postal_code: "12345",
      },
    });
  }

  static async get() {
    return await prismaClient.address.findFirstOrThrow({
      where: {
        contact: {
          username: "test",
        },
      },
    });
  }

  static async deleteAll() {
    await prismaClient.address.deleteMany({
      where: {
        contact: {
          username: "test",
        },
      },
    });
  }
}
