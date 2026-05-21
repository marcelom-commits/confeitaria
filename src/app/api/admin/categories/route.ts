import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function GET() {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ ok: true, categories });
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      imageUrl?: string;
      sortOrder?: number;
    };
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.name),
        description: body.description ?? null,
        imageUrl: body.imageUrl ?? null,
        sortOrder: body.sortOrder ?? 0,
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
