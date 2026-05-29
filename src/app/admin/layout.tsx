"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/relatorios", label: "Relatórios" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.push("/login");
        } else if (data.user.role !== "ADMIN") {
          router.push("/");
        } else {
          setAuthorized(true);
        }
      });
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="animate-pulse space-y-3 text-center">
          <div className="mx-auto h-8 w-8 rounded-full bg-stone-300" />
          <p className="text-sm text-stone-500">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden-print rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
            Admin
          </p>
          <p className="mt-2 font-serif text-2xl text-stone-900">Doce Encanto</p>
          <nav className="mt-6 space-y-2">
            {nav.map((item) => {
              const isActive = item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm ${
                    isActive
                      ? "bg-rose-100 font-semibold text-rose-800"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-6 w-full rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Sair
          </button>
          </aside>
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
