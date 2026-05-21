import { ProductsAdmin } from "@/components/admin/products-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Produtos</h1>
      </header>
      <ProductsAdmin initialProducts={products} categories={categories} />
    </div>
  );
}
