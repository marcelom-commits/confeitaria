export default function CheckoutPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
          pagamento pendente
        </p>
        <h1 className="mt-4 font-serif text-4xl text-stone-900">
          Pedido em analise
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Recebemos sua solicitacao. Assim que o pagamento for confirmado, o
          pedido sera atualizado automaticamente.
        </p>
      </div>
    </main>
  );
}
