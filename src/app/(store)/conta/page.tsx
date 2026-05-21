import Link from "next/link";

import { ProfileForm } from "@/components/account/profile-form";
import { getCustomerAccountData } from "@/lib/account";
import { requireUser } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUser();
  const user = await getCustomerAccountData(session.user.id);
  if (!user) {
    return null;
  }

  const orders = user.customerProfile?.orders?.length
    ? user.customerProfile.orders
    : user.orders;
  const addresses = user.customerProfile?.addresses ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          perfil do cliente
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Minha conta
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Atualize seus dados, gerencie enderecos e acompanhe seus pedidos.
        </p>
      </header>

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-2xl text-stone-900">Dados de perfil</h2>
        <div className="mt-4">
          <ProfileForm
            initialName={user.name ?? ""}
            initialEmail={user.email}
            initialPhone={user.customerProfile?.phone ?? ""}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-5">
          <h3 className="font-serif text-2xl text-stone-900">Enderecos</h3>
          <p className="mt-2 text-sm text-stone-600">
            {addresses.length} endereco(s) cadastrado(s)
          </p>
          <Link
            href="/conta/enderecos"
            className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Gerenciar enderecos
          </Link>
        </div>
        <div className="rounded-2xl border border-stone-200 p-5">
          <h3 className="font-serif text-2xl text-stone-900">Pedidos</h3>
          <p className="mt-2 text-sm text-stone-600">
            {orders.length} pedido(s) no historico
          </p>
          <Link
            href="/conta/pedidos"
            className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Ver pedidos
          </Link>
        </div>
      </section>
    </div>
  );
}
