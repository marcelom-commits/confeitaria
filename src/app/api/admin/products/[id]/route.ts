import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const params = await props.params;
    const body = (await request.json()) as {
      name: string;
      description?: string;
      categoryId: string;
      price: number;
      stock?: number;
      imageUrl?: string;
      isFeatured?: boolean;
      sku?: string;
      isActive?: boolean;
    };

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: slugify(body.name),
        description: body.description ?? null,
        categoryId: body.categoryId,
        price: new Prisma.Decimal(body.price),
        stock: body.stock ?? 0,
        isFeatured: body.isFeatured ?? false,
        sku: body.sku ?? null,
        isActive: body.isActive ?? true,
      },
      include: {
        images: true,
        category: true,
      },
    });

    if (body.imageUrl) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: body.imageUrl,
          alt: product.name,
          sortOrder: 1,
        },
      });
    }

    const refreshed = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, images: true },
    });
    return NextResponse.json({ ok: true, product: refreshed });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const params = await props.params;
    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
