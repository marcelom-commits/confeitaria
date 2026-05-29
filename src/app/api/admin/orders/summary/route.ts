import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/access";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  const [total, paid, delivered, shipped, canceled, pending] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...where, status: "PAID" } }),
    prisma.order.count({ where: { ...where, status: "DELIVERED" } }),
    prisma.order.count({ where: { ...where, status: "SHIPPED" } }),
    prisma.order.count({ where: { ...where, status: "CANCELED" } }),
    prisma.order.count({ where: { ...where, status: "PENDING" } }),
  ]);

  const revenueRows = await prisma.order.findMany({
    where: { ...where, status: "PAID" },
    select: { total: true },
  });
  const revenue = revenueRows.reduce((acc, o) => acc + Number(o.total), 0);

  return NextResponse.json({ total, paid, delivered, shipped, canceled, pending, revenue });
}
