import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
      <div className="flex flex-col justify-center space-y-8">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
            e-commerce de confeitaria
          </p>
          <h1 className="font-serif text-5xl leading-tight text-stone-900 sm:text-6xl">
            {siteConfig.hero.title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-stone-600">
            {siteConfig.hero.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            {siteConfig.hero.primaryCta}
          </Link>
          <a
            href="#categorias"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-rose-700 hover:text-rose-700"
          >
            {siteConfig.hero.secondaryCta}
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {["Pix e cartão", "Entrega por CEP", "Admin operacional"].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-sm font-medium text-stone-700 shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-100 via-amber-50 to-stone-100 p-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between rounded-[1.5rem] border border-white/60 bg-white/70 p-6 backdrop-blur">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
              MVP recomendado
            </span>
            <h2 className="font-serif text-3xl text-stone-900">
              Catálogo elegante com compra rápida e operação centralizada
            </h2>
          </div>

          <div className="grid gap-4">
            {[
              "Produtos com fotos, categorias e busca",
              "Checkout com frete e pagamento online",
              "Área do cliente com histórico de pedidos",
              "Painel admin para produtos, pedidos e clientes",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm text-stone-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}