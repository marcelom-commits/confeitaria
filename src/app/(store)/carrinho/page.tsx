import { CartContent } from "@/components/store/cart-content";
import { getCartTotals, getOrCreateCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getOrCreateCart();
  const { subtotal } = getCartTotals(cart.items);

  const items = cart.items.map((item) => ({
    id: item.id,
    productName: item.product.name,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    lineTotal: Number(item.unitPrice) * item.quantity,
  }));

  return (
    <main className="min-h-screen bg-[#fffaf6] px-6 py-20">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
          carrinho
        </p>
        <h1 className="mt-4 font-serif text-4xl text-stone-900">
          Resumo do pedido
        </h1>

        <div className="mt-8">
          <CartContent items={items} />
        </div>

        {items.length > 0 ? (
          <>
            <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-6">
              <span className="text-sm text-stone-600">Subtotal</span>
              <span className="text-xl font-semibold text-stone-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href="/checkout"
                className="rounded-xl bg-rose-700 px-5 py-2.5 text-sm font-medium text-white"
              >
                Ir para checkout
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
