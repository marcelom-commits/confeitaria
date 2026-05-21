import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireAdmin, requireAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, products });
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      categoryId: string;
      price: number;
      stock?: number;
      imageUrl?: string;
      isFeatured?: boolean;
      sku?: string;
    };
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slugify(body.name),
        description: body.description ?? null,
        categoryId: body.categoryId,
        price: new Prisma.Decimal(body.price),
        stock: body.stock ?? 0,
        isFeatured: body.isFeatured ?? false,
        sku: body.sku ?? null,
        images: body.imageUrl
          ? {
              create: [{ url: body.imageUrl, alt: body.name, sortOrder: 1 }],
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
