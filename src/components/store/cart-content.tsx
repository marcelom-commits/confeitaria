"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatPrice } from "@/lib/format";

type CartItem = {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Props = {
  items: CartItem[];
};

export function CartContent({ items }: Props) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(items);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateQuantity(itemId: string, newQty: number) {
    if (newQty < 1) {
      await removeItem(itemId);
      return;
    }
    setLoading(itemId);
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    setLoading(null);
    if (!response.ok) {
      alert("Erro ao atualizar quantidade.");
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQty, lineTotal: item.unitPrice * newQty }
          : item,
      ),
    );
    router.refresh();
  }

  async function removeItem(itemId: string) {
    setLoading(itemId);
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "DELETE",
    });
    setLoading(null);
    if (!response.ok) {
      alert("Erro ao remover item.");
      return;
    }
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    router.refresh();
  }

  const currentSubtotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

  return (
    <div className="space-y-4">
      {cartItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-5 text-sm text-stone-600">
          Seu carrinho esta vazio. Volte ao catalogo para adicionar produtos.
        </p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-stone-200 p-4"
          >
            <div className="flex-1">
              <p className="font-medium text-stone-900">{item.productName}</p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={loading === item.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-sm"
                >
                  -
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-medium text-stone-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={loading === item.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 text-sm"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={loading === item.id}
                  className="ml-2 text-xs text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
            <p className="font-semibold text-stone-900">
              {formatPrice(item.lineTotal)}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
