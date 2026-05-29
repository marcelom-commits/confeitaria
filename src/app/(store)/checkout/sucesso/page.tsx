import { formatOrderNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const orderNumber = Array.isArray(searchParams.orderNumber)
    ? searchParams.orderNumber[0]
    : searchParams.orderNumber;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          pagamento recebido
        </p>
        <h1 className="mt-4 font-serif text-4xl text-stone-900">
          Pedido confirmado
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Seu pagamento foi processado. Voce recebera atualizacoes por e-mail.
        </p>
        <div className="mt-6 space-y-2 text-sm text-stone-700">
          {orderNumber ? <p>Pedido {formatOrderNumber(Number(orderNumber))}</p> : null}
        </div>
      </div>
    </main>
  );
}
