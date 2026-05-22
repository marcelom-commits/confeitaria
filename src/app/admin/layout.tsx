"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionData, setSessionData] = useState<string>("carregando...");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setSessionData(JSON.stringify(data, null, 2)))
      .catch((err) => setSessionData("ERRO: " + err.message));
  }, []);

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-yellow-800">
            Debug Sessão
          </p>
          <pre className="whitespace-pre-wrap text-xs text-yellow-900">
            {sessionData}
          </pre>
        </div>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
              Admin
            </p>
            <p className="mt-2 font-serif text-2xl text-stone-900">Doce Encanto</p>
            <nav className="mt-6 space-y-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
