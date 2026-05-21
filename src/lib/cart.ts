import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const CART_COOKIE = "cart_token";

export async function getOrCreateCart() {
  const cookieStore = await cookies();
  let cartToken = cookieStore.get(CART_COOKIE)?.value;

  const isNewToken = !cartToken;
  if (!cartToken) {
    cartToken = randomUUID();
  }

  let cart = await prisma.cart.findUnique({
    where: { cartToken },
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { cartToken },
      include: {
        items: {
          include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
        },
      },
    });
  }

  if (isNewToken) {
    try {
      cookieStore.set(CART_COOKIE, cartToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {
    }
  }

  return cart;
}

export async function addToCart(productId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, price: true, isActive: true },
  });

  if (!product || !product.isActive) {
    throw new Error("Produto indisponível.");
  }

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: new Prisma.Decimal(product.price),
      },
    });
  }
}

export async function getCartByToken(cartToken: string) {
  return prisma.cart.findUnique({
    where: { cartToken },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });
}

export function getCartTotals(
  items: Array<{ quantity: number; unitPrice: Prisma.Decimal | number }>,
) {
  const subtotal = items.reduce((acc, item) => {
    const unit = typeof item.unitPrice === "number" ? item.unitPrice : Number(item.unitPrice);
    return acc + unit * item.quantity;
  }, 0);

  return { subtotal };
}
