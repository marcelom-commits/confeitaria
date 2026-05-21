import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { formatPrice } from "@/lib/format";
import { getCatalogProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CatalogPage(props: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const searchParams = await props.searchParams;
  const categoryFilter = searchParams.categoria;

  const products = await getCatalogProducts(categoryFilter);
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen bg-[#fffaf6] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Catalogo completo"
          title={categoryFilter ? `Categoria: ${categoryFilter}` : "Produtos em destaque para a primeira versao da loja"}
          description="Pagina de catalogo conectada ao banco de dados com produtos ativos."
        />

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="/catalogo"
            className={`rounded-full px-4 py-1.5 text-sm ${
              !categoryFilter
                ? "bg-stone-900 text-white"
                : "border border-stone-300 text-stone-700 hover:bg-stone-100"
            }`}
          >
            Todos
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
              className={`rounded-full px-4 py-1.5 text-sm ${
                categoryFilter === cat.name
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 text-stone-700 hover:bg-stone-100"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category.name}
              price={formatPrice(Number(product.price))}
              description={product.description ?? "Produto artesanal de confeitaria."}
              image={
                product.images[0]?.url ??
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80"
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}
