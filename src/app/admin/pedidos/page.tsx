import { OrdersAdmin } from "@/components/admin/orders-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: true,
      payment: true,
      shipment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    payment: order.payment
      ? { ...order.payment, amount: Number(order.payment.amount) }
      : null,
    shipment: order.shipment
      ? { ...order.shipment, shippingCost: Number(order.shipment.shippingCost) }
      : null,
  }));

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Pedidos</h1>
      </header>
      <OrdersAdmin initialOrders={serialized} />
    </div>
  );
}
