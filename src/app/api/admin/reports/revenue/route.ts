import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Prisma.OrderWhereInput = {
    status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] },
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { productName: true, quantity: true, unitPrice: true } },
      payment: { select: { method: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = orders.map((o) => ({
    orderNumber: o.orderNumber,
    date: o.createdAt.toISOString(),
    customer: o.user?.name ?? "Convidado",
    email: o.user?.email ?? "-",
    items: o.items.length,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shippingCost),
    total: Number(o.total),
    paymentMethod: o.payment?.method ?? "-",
    paymentStatus: o.payment?.status ?? "-",
  }));

  const totals = rows.reduce(
    (acc, r) => ({
      totalOrders: acc.totalOrders + 1,
      totalRevenue: acc.totalRevenue + r.total,
      totalShipping: acc.totalShipping + r.shipping,
    }),
    { totalOrders: 0, totalRevenue: 0, totalShipping: 0 },
  );

  return NextResponse.json({ rows, totals });
}
