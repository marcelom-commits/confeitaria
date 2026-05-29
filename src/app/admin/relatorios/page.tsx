"use client";

import { useState } from "react";
import { RevenueReport } from "@/components/admin/reports/revenue-report";
import { StockReport } from "@/components/admin/reports/stock-report";

const tabs = [
  { id: "revenue", label: "Faturamento" },
  { id: "stock", label: "Estoque" },
] as const;

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("revenue");

  return (
    <div className="space-y-6">
      <header className="hidden-print">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Relatórios</h1>
      </header>

      <div className="hidden-print flex gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-stone-200 p-5 print:border-none print:p-0">
        {activeTab === "revenue" ? <RevenueReport /> : <StockReport />}
      </section>
    </div>
  );
}
