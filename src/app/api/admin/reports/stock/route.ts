import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
    orderBy: { name: "asc" },
  });

  const rows = products.map((p) => ({
    name: p.name,
    category: p.category.name,
    sku: p.sku ?? "-",
    stock: p.stock,
    unitPrice: Number(p.price),
    totalPrice: Number(p.price) * p.stock,
    isFeatured: p.isFeatured,
  }));

  const totals = {
    totalProducts: rows.length,
    totalStock: rows.reduce((acc, r) => acc + r.stock, 0),
    lowStockItems: rows.filter((r) => r.stock <= 5).length,
    totalValue: rows.reduce((acc, r) => acc + r.totalPrice, 0),
  };

  return NextResponse.json({ rows, totals });
}
