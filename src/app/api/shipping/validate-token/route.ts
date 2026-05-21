import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string };
    const tokenCode = (body.token ?? "").trim().toUpperCase();

    if (!tokenCode) {
      return NextResponse.json(
        { ok: false, message: "Token obrigatorio." },
        { status: 400 },
      );
    }

    const shippingToken = await prisma.shippingToken.findUnique({
      where: { token: tokenCode },
    });

    if (!shippingToken) {
      return NextResponse.json(
        { ok: false, message: "Token invalido." },
        { status: 404 },
      );
    }

    if (shippingToken.isUsed) {
      return NextResponse.json(
        { ok: false, message: "Este token ja foi utilizado." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      token: shippingToken.token,
      price: Number(shippingToken.price),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
