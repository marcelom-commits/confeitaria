import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      customerProfile: {
        include: {
          addresses: true,
          orders: {
            include: { items: true, payment: true, shipment: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      orders: {
        include: { items: true, payment: true, shipment: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, customers });
}
