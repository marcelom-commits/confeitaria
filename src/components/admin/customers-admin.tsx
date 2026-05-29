"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatPrice, formatOrderNumber, orderStatusLabels } from "@/lib/format";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string | Date;
  customerProfile: {
    id: string;
    phone: string | null;
    addresses: {
      id: string;
      recipientName: string;
      street: string;
      number: string;
      district?: string;
      complement?: string | null;
      city: string;
      state: string;
      zipCode: string;
      isDefault: boolean;
    }[];
    orders: {
      id: string;
      orderNumber: number;
      status: string;
      total: number | { toString(): string };
      createdAt: string | Date;
    }[];
  } | null;
  orders: {
    id: string;
    orderNumber: number;
    status: string;
    total: number | { toString(): string };
    createdAt: string | Date;
  }[];
};

type Props = {
  customers: Customer[];
};

export function CustomersAdmin({ customers }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => {
      return (
        customer.email.toLowerCase().includes(term) ||
        (customer.name ?? "").toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl text-stone-900">Clientes</h1>
        <input
          placeholder="Buscar por nome ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-stone-300 px-4 py-2 text-sm"
        />
      </header>

      <div className="space-y-4">
        {filtered.map((customer) => {
          const orders = customer.customerProfile?.orders?.length
            ? customer.customerProfile.orders
            : customer.orders;
          const totalSpent = orders
            .filter((o) => o.status !== "CANCELED")
            .reduce((acc, order) => acc + Number(order.total), 0);
          const defaultAddress = customer.customerProfile?.addresses.find(
            (addr) => addr.isDefault,
          );

          return (
            <article
              key={customer.id}
              className="rounded-2xl border border-stone-200 bg-stone-100 p-5"
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-stone-900">
                    {customer.name ?? "Sem nome"}
                  </p>
                  <p className="text-sm text-stone-600">{customer.email}</p>
                  <p className="text-sm text-stone-600">
                    Telefone: {customer.customerProfile?.phone ?? "Nao informado"}
                  </p>
                  <p className="mt-2 text-sm text-stone-700">
                    Endereco padrao:{" "}
                    {defaultAddress
                      ? `${defaultAddress.street}, ${defaultAddress.number} - ${defaultAddress.city}/${defaultAddress.state}`
                      : "Nao definido"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 p-4 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    pedidos
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-stone-900">
                    {orders.length}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">
                    total gasto
                  </p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">
                    {formatPrice(totalSpent)}
                  </p>
                </div>
              </div>

              {orders.length ? (
                <div className="mt-4 border-t border-stone-200 pt-4">
                  <p className="text-sm font-semibold text-stone-800">
                    Historico de pedidos
                  </p>
                  <div className="mt-2 space-y-2">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <Link
                          href={`/admin/pedidos?orderId=${order.id}`}
                          className="text-stone-700 hover:text-rose-700 hover:underline"
                        >
                          {formatOrderNumber(order.orderNumber)}
                        </Link>
                        <span className="text-stone-500"> · {orderStatusLabels[order.status] ?? order.status}</span>
                        <span className={`font-semibold ${order.status === "CANCELED" ? "text-red-600 line-through" : "text-stone-900"}`}>
                          {formatPrice(Number(order.total))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
