import { NextRequest, NextResponse } from "next/server";
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
      imageUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    };
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: slugify(body.name),
        description: body.description ?? null,
        imageUrl: body.imageUrl ?? null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ ok: true, category });
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
    await prisma.category.update({
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
