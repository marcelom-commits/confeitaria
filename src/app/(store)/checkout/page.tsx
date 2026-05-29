import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { getOrCreateCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finalizar Pedido",
  description: "Informe seus dados, endereço e forma de pagamento para concluir sua compra.",
};

export default async function CheckoutPage() {
  const cart = await getOrCreateCart();
  if (!cart.items.length) {
    redirect("/carrinho");
  }

  const items = cart.items.map((item) => ({
    id: item.id,
    productName: item.product.name,
    quantity: item.quantity,
    lineTotal: Number(item.unitPrice) * item.quantity,
  }));
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);

  return (
    <main className="min-h-screen bg-[#fffaf6] px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
            checkout
          </p>
          <h1 className="mt-3 font-serif text-4xl text-stone-900">
            Finalize seu pedido
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Fluxo completo: identificacao, endereco, frete, pagamento e revisao.
          </p>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <CheckoutFlow items={items} subtotal={subtotal} />
        </div>
      </div>
    </main>
  );
}
