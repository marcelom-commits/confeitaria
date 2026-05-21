import Link from "next/link";

import { requireUser } from "@/lib/access";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-12 lg:px-8">
      <aside className="hidden w-56 shrink-0 space-y-2 sm:block">
        <Link
          href="/conta"
          className="block rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Perfil
        </Link>
        <Link
          href="/conta/enderecos"
          className="block rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Enderecos
        </Link>
        <Link
          href="/conta/pedidos"
          className="block rounded-xl px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Pedidos
        </Link>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
