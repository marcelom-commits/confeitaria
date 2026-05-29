"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { formatPrice, orderStatusLabels, paymentStatusLabels, shipmentStatusLabels } from "@/lib/format";

type Order = {
  id: string;
  orderNumber: number;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  recipientName: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: string | Date;
  user: { id: string; name: string | null; email: string } | null;
  items: { id: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }[];
  payment: { id: string; method: string | null; status: string; amount: number; gateway: string; paidAt: string | null } | null;
  shipment: { id: string; shippingMethod: string; carrier: string | null; status: string; trackingCode: string | null; shippingCost: number; estimatedDays: number | null } | null;
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
  ...orderStatusLabels,
};

export function OrdersAdmin({ initialOrders }: Props) {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(
    searchParams.get("orderId") ?? null,
  );

  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (expandedId && !initialScrollDone.current) {
      initialScrollDone.current = true;
      setTimeout(() => {
        document.getElementById(`order-${expandedId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [expandedId]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (order) =>
          order.user?.name?.toLowerCase().includes(term) ||
          order.user?.email?.toLowerCase().includes(term) ||
          String(order.orderNumber).includes(term),
      );
    }
    return result;
  }, [orders, statusFilter, search]);

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
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por nome, email ou nº"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
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
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, index) => {
          const isExpanded = expandedId === order.id;
          return (
            <article
              key={order.id}
              id={isExpanded ? `order-${order.id}` : undefined}
              className={`rounded-2xl border border-stone-200 ${isExpanded ? "bg-stone-100" : ""}`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="flex w-full flex-wrap items-start justify-between gap-4 p-4 text-left transition hover:bg-stone-50"
              >
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">
                    Pedido #{String(order.orderNumber ?? index + 1).padStart(5, "0")}
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
                  <p className={`font-semibold ${order.status === "CANCELED" ? "text-red-600 line-through" : "text-stone-900"}`}>
                    {formatPrice(Number(order.total))}
                  </p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === "PENDING"
                      ? "bg-orange-100 text-orange-800"
                      : order.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.status === "PREPARING"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "CANCELED"
                                ? "bg-red-100 text-red-800"
                                : "bg-stone-100 text-stone-600"
                  }`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      void updateStatus(order.id, e.target.value);
                    }}
                    disabled={loading}
                    className="block rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
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
              </button>

              {isExpanded ? (
                <div className="border-t border-stone-200 p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">Endereço de entrega</p>
                      <p className="text-sm text-stone-700">{order.recipientName}</p>
                      <p className="text-sm text-stone-600">
                        {order.street}, {order.number}{order.complement ? ` - ${order.complement}` : ""}
                      </p>
                      <p className="text-sm text-stone-600">
                        {order.district ? `${order.district} - ` : ""}{order.city}/{order.state}
                      </p>
                      <p className="text-sm text-stone-600">CEP: {order.zipCode}</p>
                      {order.notes ? (
                        <p className="mt-1 text-sm text-stone-600">Obs: {order.notes}</p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">Pagamento</p>
                      {order.payment ? (
                        <>
                          <p className="text-sm text-stone-700">Método: {order.payment.method ?? "-"}</p>
                          <p className="text-sm text-stone-600">Status: {paymentStatusLabels[order.payment.status] ?? order.payment.status}</p>
                          <p className="text-sm text-stone-600">Valor: {formatPrice(order.payment.amount)}</p>
                          {order.payment.paidAt ? (
                            <p className="text-sm text-stone-600">Pago em: {new Date(order.payment.paidAt).toLocaleString("pt-BR")}</p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-sm text-stone-400">Nenhum</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">Frete</p>
                      {order.shipment ? (
                        <>
                          <p className="text-sm text-stone-700">Método: {order.shipment.shippingMethod}</p>
                          <p className="text-sm text-stone-600">Transportadora: {order.shipment.carrier ?? "-"}</p>
                          <p className="text-sm text-stone-600">Status: {shipmentStatusLabels[order.shipment.status] ?? order.shipment.status}</p>
                          <p className="text-sm text-stone-600">Custo: {formatPrice(order.shipment.shippingCost)}</p>
                          {order.shipment.trackingCode ? (
                            <p className="text-sm text-stone-600">Código: {order.shipment.trackingCode}</p>
                          ) : null}
                          {order.shipment.estimatedDays ? (
                            <p className="text-sm text-stone-600">Previsão: {order.shipment.estimatedDays} dia(s)</p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-sm text-stone-400">Nenhum</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">Valores</p>
                      <p className="text-sm text-stone-600">Subtotal: {formatPrice(order.subtotal)}</p>
                      <p className="text-sm text-stone-600">Frete: {formatPrice(order.shippingCost)}</p>
                      <p className="text-sm font-semibold text-stone-900">Total: {formatPrice(Number(order.total))}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">Itens do pedido</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 text-xs text-stone-500">
                          <th className="py-1 pr-3 text-left">Produto</th>
                          <th className="py-1 pr-3 text-left">Qtd</th>
                          <th className="py-1 pr-3 text-right">Unit.</th>
                          <th className="py-1 pr-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b border-stone-100">
                            <td className="py-1.5 pr-3 text-stone-700">{item.productName}</td>
                            <td className="py-1.5 pr-3 text-stone-600">{item.quantity}</td>
                            <td className="py-1.5 pr-3 text-right text-stone-600">{formatPrice(Number(item.unitPrice))}</td>
                            <td className="py-1.5 pr-3 text-right font-semibold text-stone-900">{formatPrice(Number(item.totalPrice))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
