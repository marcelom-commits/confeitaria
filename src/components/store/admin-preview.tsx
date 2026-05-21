const adminBlocks = [
  {
    title: "Produtos",
    description: "Cadastro, edição de preços, fotos e categorias.",
  },
  {
    title: "Pedidos",
    description: "Acompanhamento do fluxo, pagamento e entrega.",
  },
  {
    title: "Clientes",
    description: "Visualização de perfis, histórico e dados de contato.",
  },
];

export function AdminPreview() {
  return (
    <section
      id="admin"
      className="rounded-[2rem] border border-stone-200 bg-stone-950 px-6 py-10 text-white shadow-xl lg:px-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
            backoffice pronto para operação
          </p>
          <h2 className="font-serif text-4xl">
            Um painel administrativo pensado para rotina real de confeitaria
          </h2>
          <p className="text-sm leading-7 text-stone-300">
            A base do projeto já considera gestão centralizada de catálogo,
            pedidos e clientes para acelerar a operação diária do negócio.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {adminBlocks.map((block) => (
            <article
              key={block.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
            >
              <h3 className="font-serif text-2xl text-white">{block.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}