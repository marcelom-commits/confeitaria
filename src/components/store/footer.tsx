import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-white">{siteConfig.name}</h3>
          <p className="max-w-sm text-sm leading-6 text-stone-400">
            Confeitaria online pensada para pedidos rápidos, entrega eficiente e
            experiência premium do catálogo ao checkout.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-400">
            Atendimento
          </h4>
          <ul className="space-y-2 text-sm text-stone-300">
            <li>{siteConfig.phone}</li>
            <li>{siteConfig.email}</li>
            <li>Entrega em regiões selecionadas</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-400">
            Base do MVP
          </h4>
          <ul className="space-y-2 text-sm text-stone-300">
            <li>Catálogo com categorias e destaque</li>
            <li>Carrinho e checkout estruturados</li>
            <li>Painel administrativo preparado</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}