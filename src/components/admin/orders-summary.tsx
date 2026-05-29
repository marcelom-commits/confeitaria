"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";

type SummaryData = {
  total: number;
  paid: number;
  delivered: number;
  shipped: number;
  canceled: number;
  pending: number;
  revenue: number;
};

const periods = [
  { value: "all", label: "Todo período" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "year", label: "Este ano" },
] as const;

function getDateRange(period: string) {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: now.toISOString() };
    case "week": {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: now.toISOString() };
    }
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: now.toISOString() };
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: now.toISOString() };
    default:
      return { from: "", to: "" };
  }
}

export function OrdersSummary() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<SummaryData | null>(null);

  const fetchSummary = useCallback(async () => {
    const range = getDateRange(period);
    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    const res = await fetch(`/api/admin/orders/summary?${params.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as SummaryData;
      setData(json);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
    const handler = () => fetchSummary();
    window.addEventListener("order-updated", handler);
    return () => window.removeEventListener("order-updated", handler);
  }, [fetchSummary]);

  const cards = useMemo(
    () => [
      { label: "Pagos", value: data?.paid ?? 0, color: "text-green-700" },
      { label: "Enviados", value: data?.shipped ?? 0, color: "text-purple-700" },
      { label: "Entregues", value: data?.delivered ?? 0, color: "text-emerald-700" },
      { label: "Pendentes", value: data?.pending ?? 0, color: "text-orange-700" },
      { label: "Cancelados", value: data?.canceled ?? 0, color: "text-red-700" },
    ],
    [data],
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Resumo de pedidos
        </p>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-xl border border-stone-200 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Total</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">{data?.total ?? 0}</p>
        </article>
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-stone-500">{card.label}</p>
            <p className={`mt-1 text-xl font-semibold ${card.color}`}>{card.value}</p>
          </article>
        ))}
      </div>

      {data ? (
        <p className="text-xs text-stone-400">
          Receita no período: <span className="font-semibold text-stone-600">{formatPrice(data.revenue)}</span>
        </p>
      ) : null}
    </section>
  );
}
