import { AdminPreview } from "@/components/store/admin-preview";
import { CategoryCard } from "@/components/store/category-card";
import { Hero } from "@/components/store/hero";
import { HighlightGrid } from "@/components/store/highlight-grid";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { formatPrice } from "@/lib/format";
import { getCatalogCategories, getCatalogProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
  ]);

  return (
    <>
      <Hero />

      <section id="categorias" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionHeading
          eyebrow="Catalogo"
          title="Categorias pensadas para destacar produtos artesanais"
          description="Estrutura inicial do e-commerce com organizacao simples, visual rica e espaco para filtros, busca e paginas por categoria."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              description={category.description ?? "Categoria de confeitaria"}
              image={
                category.imageUrl ??
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80"
              }
            />
          ))}
        </div>
      </section>

      <section id="destaques" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionHeading
          eyebrow="Destaques"
          title="Produtos em evidencia para impulsionar conversao"
          description="Cards conectados ao banco para foto, categoria, preco e CTA de compra."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category.name}
              price={formatPrice(Number(product.price))}
              description={product.description ?? "Produto artesanal de confeitaria."}
              image={
                product.images[0]?.url ??
                "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80"
              }
            />
          ))}
        </div>
      </section>

      <section
        id="como-funciona"
        className="mx-auto max-w-7xl px-6 py-16 lg:px-8"
      >
        <SectionHeading
          eyebrow="Operacao"
          title="Base funcional para catalogo, checkout e experiencia do cliente"
          description="Fluxo inicial pronto para compra simples, carrinho persistente e autenticacao."
        />
        <div className="mt-10">
          <HighlightGrid />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <AdminPreview />
      </section>
    </>
  );
}