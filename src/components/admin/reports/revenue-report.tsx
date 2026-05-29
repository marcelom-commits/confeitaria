"use client";

import { useCallback, useState } from "react";
import { formatPrice } from "@/lib/format";

type Row = {
  orderNumber: number;
  date: string;
  customer: string;
  email: string;
  items: number;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
};

type Totals = {
  totalOrders: number;
  totalRevenue: number;
  totalShipping: number;
};

function toCSV(rows: Row[]): string {
  const header = [
    "Pedido", "Data", "Cliente", "Email", "Itens",
    "Subtotal", "Frete", "Total", "Pagamento", "Status",
  ];
  const lines = rows.map((r) =>
    [
      r.orderNumber,
      new Date(r.date).toLocaleDateString("pt-BR"),
      r.customer,
      r.email,
      r.items,
      r.subtotal.toFixed(2),
      r.shipping.toFixed(2),
      r.total.toFixed(2),
      r.paymentMethod,
      r.paymentStatus,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RevenueReport() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/admin/reports/revenue?${params}`);
      const data = await res.json();
      setRows(data.rows);
      setTotals(data.totals);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  function exportCSV() {
    downloadFile(toCSV(rows), `faturamento-${startDate}-${endDate}.csv`, "text/csv");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="hidden-print flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Data inicial
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Data final
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={fetchReport}
          disabled={loading}
          className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Gerar relatório"}
        </button>
      </div>

      <div className="print-only hidden">
        <div className="text-center border-b border-stone-300 pb-4 mb-6">
          <h1 className="font-serif text-3xl text-stone-900">Doce Encanto</h1>
          <p className="text-sm text-stone-500">Confeitaria Artesanal</p>
          <h2 className="mt-4 text-lg font-semibold text-stone-800">Relatório de Faturamento</h2>
          <p className="text-sm text-stone-500">
            {new Date(startDate).toLocaleDateString("pt-BR")} — {new Date(endDate).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Pedidos</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.totalOrders}</p>
          </div>
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Faturamento</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{formatPrice(totals.totalRevenue)}</p>
          </div>
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Frete total</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{formatPrice(totals.totalShipping)}</p>
          </div>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="space-y-3">
          <div className="hidden-print flex items-center justify-between">
            <p className="text-sm text-stone-500">{rows.length} pedido(s)</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportCSV}
                className="rounded-xl border border-stone-300 px-4 py-1.5 text-xs"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-stone-300 px-4 py-1.5 text-xs"
              >
                Imprimir / PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm print:text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.1em] text-stone-500">
                  <th className="py-2 pr-3">Pedido</th>
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Itens</th>
                  <th className="py-2 pr-3">Subtotal</th>
                  <th className="py-2 pr-3">Frete</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.orderNumber} className="border-b border-stone-100">
                    <td className="py-2 pr-3 font-medium text-stone-900">#{r.orderNumber}</td>
                    <td className="py-2 pr-3 text-stone-600">
                      {new Date(r.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 pr-3 text-stone-700">{r.customer}</td>
                    <td className="py-2 pr-3 text-stone-600">{r.items}</td>
                    <td className="py-2 pr-3 text-stone-600">{formatPrice(r.subtotal)}</td>
                    <td className="py-2 pr-3 text-stone-600">{formatPrice(r.shipping)}</td>
                    <td className="py-2 pr-3 text-right font-semibold text-stone-900">
                      {formatPrice(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-stone-400">
          {loading ? "" : "Clique em \"Gerar relatório\" para exibir os dados."}
        </p>
      )}
    </div>
  );
}
