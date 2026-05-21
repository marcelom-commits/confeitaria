export default function CheckoutFailurePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">
          pagamento nao concluido
        </p>
        <h1 className="mt-4 font-serif text-4xl text-stone-900">
          Houve um problema no pagamento
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Voce pode retornar ao checkout e tentar novamente com outro metodo.
        </p>
      </div>
    </main>
  );
}
