import Link from "next/link";

import { formatPrice } from "@/lib/format";
import { getCustomerAccountData } from "@/lib/account";
import { requireUser } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await requireUser();
  const user = await getCustomerAccountData(session.user.id);
  if (!user) return null;

  const orders = user.customerProfile?.orders?.length
    ? user.customerProfile.orders
    : user.orders;

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          conta
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Historico de pedidos
        </h1>
      </header>

      {!orders.length ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-5 text-sm text-stone-600">
          Voce ainda nao possui pedidos.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-stone-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-900">
                    Pedido #{String(order.orderNumber ?? 0).padStart(5, "0")}
                  </p>
                  <p className="text-sm text-stone-600">
                    Status: {order.status} ·{" "}
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-stone-900">
                    {formatPrice(Number(order.total))}
                  </p>
                  <Link
                    href={`/conta/pedidos/${order.id}`}
                    className="text-sm text-rose-700 hover:underline"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
