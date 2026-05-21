import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export async function registerCustomer(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email já cadastrado.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      role: "CUSTOMER",
      customerProfile: {
        create: {
          phone: input.phone,
        },
      },
    },
  });
}
