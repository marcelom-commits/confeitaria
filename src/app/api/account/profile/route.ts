import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const userCheck = await requireUserApi();
  if ("error" in userCheck) return userCheck.error;

  try {
    const session = userCheck.session;
    const body = (await request.json()) as { name?: string; phone?: string };

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name?.trim() || null,
        customerProfile: {
          upsert: {
            create: { phone: body.phone?.trim() || null },
            update: { phone: body.phone?.trim() || null },
          },
        },
      },
      include: { customerProfile: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
