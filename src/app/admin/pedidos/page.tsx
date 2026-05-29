import { OrdersAdmin } from "@/components/admin/orders-admin";
import { OrdersSummary } from "@/components/admin/orders-summary";
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
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    notes: order.notes,
    recipientName: order.recipientName,
    street: order.street,
    number: order.number,
    complement: order.complement,
    district: order.district,
    city: order.city,
    state: order.state,
    zipCode: order.zipCode,
    createdAt: order.createdAt.toISOString(),
    user: order.user ? { id: order.user.id, name: order.user.name, email: order.user.email } : null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          gateway: order.payment.gateway,
          paidAt: order.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    shipment: order.shipment
      ? {
          id: order.shipment.id,
          shippingMethod: order.shipment.shippingMethod,
          carrier: order.shipment.carrier,
          status: order.shipment.status,
          trackingCode: order.shipment.trackingCode,
          shippingCost: Number(order.shipment.shippingCost),
          estimatedDays: order.shipment.estimatedDays,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <OrdersSummary />
      <OrdersAdmin initialOrders={serialized} />
    </div>
  );
}
