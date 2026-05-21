"use client";

import { useMemo, useState } from "react";

import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string | Date;
  user: { id: string; name: string | null; email: string } | null;
  items: { id: string; productName: string; quantity: number }[];
};

type Props = {
  initialOrders: Order[];
};

const statuses = [
  "ALL",
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
] as const;

const statusLabels: Record<string, string> = {
  ALL: "Todos",
  PENDING: "Pendente",
  PAID: "Pago",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export function OrdersAdmin({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>(
    "ALL",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  async function updateStatus(orderId: string, status: string) {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await response.json()) as {
      ok: boolean;
      message?: string;
      order?: { id: string; status: string };
    };
    setLoading(false);
    if (!response.ok || !data.ok || !data.order) {
      setMessage(data.message ?? "Falha ao atualizar status.");
      return;
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.id === data.order!.id
          ? { ...order, status: data.order!.status }
          : order,
      ),
    );
    setMessage("Status atualizado.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl text-stone-900">Pedidos</h1>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as (typeof statuses)[number])
          }
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, index) => (
          <article key={order.id} className="rounded-2xl border border-stone-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-900">
                  Pedido #{String(index + 1).padStart(5, "0")}
                </p>
                <p className="text-sm text-stone-600">
                  {order.user?.name ?? "Cliente"} · {order.user?.email ?? "sem email"}
                </p>
                <p className="text-sm text-stone-600">
                  {new Date(order.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  {order.items.map((item) => `${item.productName} (${item.quantity})`).join(", ")}
                </p>
              </div>

              <div className="space-y-2 text-right">
                <p className="font-semibold text-stone-900">
                  {formatPrice(Number(order.total))}
                </p>
                <p className="text-sm text-stone-600">Status: {statusLabels[order.status] ?? order.status}</p>
                <select
                  value={order.status}
                  onChange={(e) => {
                    void updateStatus(order.id, e.target.value);
                  }}
                  disabled={loading}
                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
                >
                  {statuses
                    .filter((status) => status !== "ALL")
                    .map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>

      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
