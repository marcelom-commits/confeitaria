import { CategoriesAdmin } from "@/components/admin/categories-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          admin
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Categorias</h1>
      </header>
      <CategoriesAdmin initialCategories={categories} />
    </div>
  );
}
