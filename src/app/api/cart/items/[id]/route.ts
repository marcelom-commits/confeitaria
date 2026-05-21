import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getCartIdFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get("cart_token")?.value;
  if (!cartToken) return null;
  const cart = await prisma.cart.findUnique({
    where: { cartToken },
    select: { id: true },
  });
  return cart?.id ?? null;
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const cartId = await getCartIdFromToken();
    if (!cartId) {
      return NextResponse.json({ ok: false, message: "Carrinho nao encontrado." }, { status: 404 });
    }

    const body = (await request.json()) as { quantity: number };
    const item = await prisma.cartItem.findFirst({
      where: { id: params.id, cartId },
    });
    if (!item) {
      return NextResponse.json({ ok: false, message: "Item nao encontrado." }, { status: 404 });
    }

    if (body.quantity < 1) {
      await prisma.cartItem.delete({ where: { id: params.id } });
      return NextResponse.json({ ok: true, deleted: true });
    }

    await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity: body.quantity },
    });
    return NextResponse.json({ ok: true });
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
  try {
    const params = await props.params;
    const cartId = await getCartIdFromToken();
    if (!cartId) {
      return NextResponse.json({ ok: false, message: "Carrinho nao encontrado." }, { status: 404 });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: params.id, cartId },
    });
    if (!item) {
      return NextResponse.json({ ok: false, message: "Item nao encontrado." }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
