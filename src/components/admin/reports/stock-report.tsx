"use client";

import { useCallback, useState } from "react";
import { formatPrice } from "@/lib/format";

type Row = {
  name: string;
  category: string;
  sku: string;
  stock: number;
  unitPrice: number;
  totalPrice: number;
  isFeatured: boolean;
};

type Totals = {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  totalValue: number;
};

function toCSV(rows: Row[]): string {
  const header = ["Produto", "Categoria", "SKU", "Estoque", "Preco Unit.", "Preco Total", "Destaque"];
  const lines = rows.map((r) =>
    [r.name, r.category, r.sku, r.stock, r.unitPrice.toFixed(2), r.totalPrice.toFixed(2), r.isFeatured ? "Sim" : "Nao"].join(","),
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

export function StockReport() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/stock");
      const data = await res.json();
      setRows(data.rows);
      setTotals(data.totals);
    } finally {
      setLoading(false);
    }
  }, []);

  function exportCSV() {
    downloadFile(toCSV(rows), "estoque.csv", "text/csv");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="hidden-print flex items-center gap-3">
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
          <h2 className="mt-4 text-lg font-semibold text-stone-800">Relatório de Estoque</h2>
          <p className="text-sm text-stone-500">Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Produtos</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.totalProducts}</p>
          </div>
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Estoque total</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{totals.totalStock} un.</p>
          </div>
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Valor total</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{formatPrice(totals.totalValue)}</p>
          </div>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="space-y-3">
          <div className="hidden-print flex items-center justify-between">
            <p className="text-sm text-stone-500">{rows.length} produto(s)</p>
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
                  <th className="py-2 pr-3">Produto</th>
                  <th className="py-2 pr-3">Categoria</th>
                  <th className="py-2 pr-3">SKU</th>
                  <th className="py-2 pr-3">Estoque</th>
                  <th className="py-2 pr-3 text-right">Preço Unit.</th>
                  <th className="py-2 pr-3 text-right">Preço Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b border-stone-100 ${
                      r.stock <= 5 ? "bg-rose-50" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-medium text-stone-900">{r.name}</td>
                    <td className="py-2 pr-3 text-stone-600">{r.category}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-stone-500">{r.sku}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`font-semibold ${
                          r.stock <= 5 ? "text-rose-700" : "text-stone-900"
                        }`}
                      >
                        {r.stock}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-stone-900">
                      {formatPrice(r.unitPrice)}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold text-stone-900">
                      {formatPrice(r.totalPrice)}
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
