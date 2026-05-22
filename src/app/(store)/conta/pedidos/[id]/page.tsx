import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { formatPrice, orderStatusLabels, paymentStatusLabels } from "@/lib/format";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PixPaymentInfo } from "@/components/store/pix-payment-info";

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUser();
  const params = await props.params;
  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      OR: [
        { userId: session.user.id },
        { customerProfile: { userId: session.user.id } },
      ],
    },
    include: {
      items: true,
      payment: true,
      shipment: true,
    },
  });

  if (!order) notFound();

  const isPixPending =
    order.payment?.method === "pix" && order.payment?.status === "PENDING";

  let qrCodeDataUrl: string | null = null;
  let pixKey = "";
  let pixKeyType = "";
  let pixReceiver = "";
  if (isPixPending) {
    const raw = order.payment?.rawResponse as Record<string, unknown> | null;
    pixKey = (raw?.pixKey as string) ?? process.env.NEXT_PUBLIC_PIX_KEY ?? "";
    pixKeyType = (raw?.pixKeyType as string) ?? process.env.NEXT_PUBLIC_PIX_KEY_TYPE ?? "telefone";
    pixReceiver = (raw?.pixReceiver as string) ?? process.env.NEXT_PUBLIC_PIX_RECEIVER ?? "";
    try {
      qrCodeDataUrl = await QRCode.toDataURL(pixKey, { width: 300, margin: 2 });
    } catch {
      qrCodeDataUrl = null;
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          pedido
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">
          Pedido #{String(order.orderNumber ?? 0).padStart(5, "0")}
        </h1>
      </header>

      <section className="rounded-2xl border border-stone-200 p-5">
        <p className="text-sm text-stone-600">
          Status: <span className="font-semibold text-stone-900">{orderStatusLabels[order.status] ?? order.status}</span>
        </p>
        <p className="text-sm text-stone-600">
          Pagamento:{" "}
          <span className="font-semibold text-stone-900">
            {paymentStatusLabels[order.payment?.status ?? ""] ?? order.payment?.status ?? "Pendente"}
          </span>
        </p>
        {isPixPending ? (
          <PixPaymentInfo
            pixKey={pixKey}
            pixKeyType={pixKeyType}
            pixReceiver={pixReceiver}
            amount={Number(order.total)}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        ) : null}
      </section>

      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-2xl text-stone-900">Itens</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-stone-700">
                {item.productName} x {item.quantity}
              </span>
              <span className="font-semibold text-stone-900">
                {formatPrice(Number(item.totalPrice))}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-stone-200 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Frete</span>
            <span>{formatPrice(Number(order.shippingCost))}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
