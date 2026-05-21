import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";

import { requireAdmin } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const status = request.nextUrl.searchParams.get("status");

  const orders = await prisma.order.findMany({
    where:
      status && status !== "ALL"
        ? {
            status: status as OrderStatus,
          }
        : undefined,
    include: {
      items: true,
      payment: true,
      shipment: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, orders });
}
