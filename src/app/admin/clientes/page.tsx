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
      <CustomersAdmin customers={customers} />
    </div>
  );
}
