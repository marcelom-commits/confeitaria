"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: string;
};

export function AddToCartButton({ productId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        alert(data.message ?? "Erro ao adicionar ao carrinho.");
        return;
      }
      router.push("/carrinho");
      router.refresh();
    } catch {
      alert("Erro ao adicionar ao carrinho.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
    >
      {loading ? "Adicionando..." : "Adicionar"}
    </button>
  );
}
