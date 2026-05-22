import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";
import { PixPaymentInfo } from "@/components/store/pix-payment-info";
import { buildPixBRCode } from "@/lib/pix-brcode";
import { getPixSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export default async function CheckoutPendingPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const orderId = Array.isArray(searchParams.orderId)
    ? searchParams.orderId[0]
    : searchParams.orderId;

  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
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
    const dbSettings = await getPixSettings();
    pixKey = dbSettings.pixKey;
    pixKeyType = dbSettings.pixKeyType;
    pixReceiver = dbSettings.pixReceiver;
    const amount = Number(order.total);
    try {
      const pixBRCode = buildPixBRCode({
        pixKey,
        merchantName: pixReceiver || "Doce Encanto",
        merchantCity: "Brasilia",
        amount,
      });
      qrCodeDataUrl = await QRCode.toDataURL(pixBRCode, { width: 300, margin: 2 });
    } catch {
      qrCodeDataUrl = null;
    }
  }

  if (!isPixPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6">
        <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            pagamento pendente
          </p>
          <h1 className="mt-4 font-serif text-4xl text-stone-900">
            Pedido em análise
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            Recebemos sua solicitação. Assim que o pagamento for confirmado, o
            pedido será atualizado automaticamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            aguardando pagamento
          </p>
          <h1 className="mt-4 font-serif text-4xl text-stone-900">
            Pedido #{String(order.orderNumber ?? 0).padStart(5, "0")}
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            Pague com PIX abaixo para confirmar seu pedido.
          </p>
          <p className="mt-1 text-xs text-stone-500">Pedido: {order.id}</p>
        </div>

        <PixPaymentInfo
          pixKey={pixKey}
          pixKeyType={pixKeyType}
          pixReceiver={pixReceiver}
          amount={Number(order.total)}
          qrCodeDataUrl={qrCodeDataUrl}
        />

        <p className="text-center text-xs text-stone-400">
          Após o pagamento, o pedido será atualizado automaticamente.
          Você também pode acompanhar na sua conta.
        </p>
      </div>
    </main>
  );
}
