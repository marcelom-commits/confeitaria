import { prisma } from "@/lib/prisma";

export async function getCatalogProducts(categoryName?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryName
        ? { category: { name: categoryName } }
        : {}),
    },
    include: {
      category: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getCatalogCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
