import { NextRequest, NextResponse } from "next/server";

import { addToCart } from "@/lib/cart";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { productId?: string; quantity?: number };
    const productId = body.productId;

    if (!productId) {
      return NextResponse.json(
        { ok: false, message: "productId obrigatorio." },
        { status: 400 },
      );
    }

    await addToCart(productId, body.quantity ?? 1);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Erro ao adicionar ao carrinho.",
      },
      { status: 400 },
    );
  }
}
