"use client";

import { useState } from "react";

import { formatPrice } from "@/lib/format";

type ShippingToken = {
  token: string;
  price: { toString(): string };
  isUsed: boolean;
  orderId: string | null;
  createdAt: string;
  usedAt: string | null;
};

type Props = {
  initialTokens: ShippingToken[];
};

export function ShippingTokensAdmin({ initialTokens }: Props) {
  const [tokens, setTokens] = useState(initialTokens);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/shipping-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(price) }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Erro ao gerar token.");
      }
      setTokens((prev) => [
        {
          token: data.token,
          price: Number(data.price),
          isUsed: false,
          orderId: null,
          createdAt: new Date().toISOString(),
          usedAt: null,
        },
        ...prev,
      ]);
      setPrice("");
      setMessage(`Token gerado: ${data.token} — ${formatPrice(data.price)}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 p-5">
      <h2 className="font-serif text-2xl text-stone-900">
        Tokens de entrega
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Gere tokens para clientes de localidades fora das regiões fixas.
      </p>

      <form onSubmit={handleGenerate} className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Valor do frete (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="Ex: 30.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !price}
          className="h-fit shrink-0 rounded-xl bg-stone-900 px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar token"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-3 text-sm ${
            message.includes("Token gerado")
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      ) : null}

      {tokens.length > 0 ? (
        <div className="mt-6 space-y-2">
          {tokens.slice(0, 20).map((t) => (
            <div
              key={t.token}
              className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm"
            >
              <div>
                <span className="font-mono font-semibold text-stone-900">
                  {t.token}
                </span>
                <span className="ml-3 text-stone-500">
                  {formatPrice(Number(t.price))}
                </span>
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  t.isUsed ? "text-stone-400" : "text-green-600"
                }`}
              >
                {t.isUsed ? "Usado" : "Ativo"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-400">
          Nenhum token gerado ainda.
        </p>
      )}
    </section>
  );
}
