import Link from "next/link";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/clientes", label: "Clientes" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
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
    </main>
  );
}
