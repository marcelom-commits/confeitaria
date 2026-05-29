import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ShippingTokensAdmin } from "@/components/admin/shipping-tokens-admin";
import { PixSettingsAdmin } from "@/components/admin/pix-settings-admin";
import { WhatsAppSettingsAdmin } from "@/components/admin/whatsapp-settings-admin";
import { MercadoPagoSettingsAdmin } from "@/components/admin/mercado-pago-settings-admin";
import { OrdersSummary } from "@/components/admin/orders-summary";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [ordersCount, customersCount, paidOrders, shippingTokens] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      where: { status: "PAID" },
      select: { total: true },
    }),
    prisma.shippingToken.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const revenue = paidOrders.reduce((acc, order) => acc + Number(order.total), 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          painel admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Dashboard</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-stone-200 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            total de pedidos
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">{ordersCount}</p>
        </article>
        <article className="rounded-2xl border border-stone-200 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            receita (pagos)
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">
            {formatPrice(revenue)}
          </p>
        </article>
        <article className="rounded-2xl border border-stone-200 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            clientes
          </p>
          <p className="mt-2 text-3xl font-semibold text-stone-900">
            {customersCount}
          </p>
        </article>
      </section>

      <OrdersSummary />

      <PixSettingsAdmin />

      <WhatsAppSettingsAdmin />

      <MercadoPagoSettingsAdmin />

      <ShippingTokensAdmin
        initialTokens={shippingTokens.map((t) => ({
          token: t.token,
          price: t.price,
          isUsed: t.isUsed,
          orderId: t.orderId,
          createdAt: t.createdAt.toISOString(),
          usedAt: t.usedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
