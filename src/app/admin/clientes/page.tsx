import { CustomersAdmin } from "@/components/admin/customers-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      customerProfile: {
        include: {
          addresses: true,
          orders: {
            include: {
              items: true,
              payment: true,
              shipment: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      orders: {
        include: {
          items: true,
          payment: true,
          shipment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Clientes</h1>
      </header>
      <CustomersAdmin customers={customers} />
    </div>
  );
}
