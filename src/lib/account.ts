import { prisma } from "@/lib/prisma";

export async function getCustomerAccountData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: {
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
          orders: {
            include: {
              items: true,
              payment: true,
              shipment: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      orders: {
        include: {
          items: true,
          payment: true,
          shipment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return user;
}
