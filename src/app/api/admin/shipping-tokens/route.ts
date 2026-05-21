import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";

import { requireAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const tokens = await prisma.shippingToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ ok: true, tokens });
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const body = (await request.json()) as { price: number };
    const price = Number(body.price);

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { ok: false, message: "Valor do frete invalido." },
        { status: 400 },
      );
    }

    const token = randomBytes(4).toString("hex").toUpperCase();

    const shippingToken = await prisma.shippingToken.create({
      data: {
        token,
        price: new Prisma.Decimal(price),
      },
    });

    return NextResponse.json({ ok: true, token: shippingToken.token, price: Number(shippingToken.price) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
