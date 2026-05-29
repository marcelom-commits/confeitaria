"use client";

import { useState } from "react";

import { formatPrice } from "@/lib/format";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: number | { toString(): string };
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  sku: string | null;
  category: { id: string; name: string };
  images: { id: string; url: string }[];
};

type Props = {
  initialProducts: Product[];
  categories: Category[];
};

export function ProductsAdmin({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    price: 0,
    stock: 0,
    isFeatured: false,
    isActive: true,
    sku: "",
    imageUrl: "",
  });

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      price: 0,
      stock: 0,
      isFeatured: false,
      isActive: true,
      sku: "",
      imageUrl: "",
    });
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      price: Number(product.price),
      stock: product.stock,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      sku: product.sku ?? "",
      imageUrl: product.images[0]?.url ?? "",
    });
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        url?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.message ?? "Falha no upload.");
      }
      setForm((v) => ({ ...v, imageUrl: data.url! }));
      setMessage("Imagem enviada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct() {
    setLoading(true);
    setMessage(null);
    const isEdit = Boolean(editingId);
    const response = await fetch(
      isEdit ? `/api/admin/products/${editingId}` : "/api/admin/products",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          categoryId: form.categoryId,
          price: Number(form.price),
          stock: Number(form.stock),
          isFeatured: form.isFeatured,
          isActive: form.isActive,
          sku: form.sku || undefined,
          imageUrl: form.imageUrl || undefined,
        }),
      },
    );
    const data = (await response.json()) as {
      ok: boolean;
      message?: string;
      product?: Product;
    };
    setLoading(false);
    if (!response.ok || !data.ok || !data.product) {
      setMessage(data.message ?? "Nao foi possivel salvar produto.");
      return;
    }

    if (isEdit) {
      setProducts((prev) =>
        prev.map((item) => (item.id === data.product!.id ? data.product! : item)),
      );
      setMessage("Produto atualizado.");
    } else {
      setProducts((prev) => [data.product!, ...prev]);
      setMessage("Produto criado.");
    }
    resetForm();
  }

  async function inactivateProduct(id: string) {
    if (!window.confirm("Tem certeza que deseja inativar este produto?")) return;
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { ok: boolean; message?: string };
    setLoading(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message ?? "Falha ao inativar produto.");
      return;
    }
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
    );
    setMessage("Produto inativado.");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-2xl text-stone-900">
          {editingId ? "Editar produto" : "Novo produto"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Nome do produto</span>
            <input className="w-full rounded-xl border border-stone-300 px-4 py-3" placeholder="Ex: Bolo Red Velvet" value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Categoria</span>
            <select className="w-full rounded-xl border border-stone-300 px-4 py-3" value={form.categoryId} onChange={(e) => setForm((v) => ({ ...v, categoryId: e.target.value }))}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">SKU (código interno)</span>
            <input className="w-full rounded-xl border border-stone-300 px-4 py-3" placeholder="Ex: BRV-1KG" value={form.sku} onChange={(e) => setForm((v) => ({ ...v, sku: e.target.value }))} />
          </label>
          <label className="sm:col-span-2 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Descricao</span>
            <input className="w-full rounded-xl border border-stone-300 px-4 py-3" placeholder="Descricao do produto" value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Preco (R$)</span>
            <input type="number" step="0.01" min="0" className="w-full rounded-xl border border-stone-300 px-4 py-3" placeholder="Ex: 169.90" value={form.price} onChange={(e) => setForm((v) => ({ ...v, price: Number(e.target.value || 0) }))} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Estoque (unidades)</span>
            <input type="number" min="0" className="w-full rounded-xl border border-stone-300 px-4 py-3" placeholder="Ex: 10" value={form.stock} onChange={(e) => setForm((v) => ({ ...v, stock: Number(e.target.value || 0) }))} />
          </label>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Imagem do produto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void uploadFile(file);
                }
              }}
              className="w-full rounded-xl border border-stone-300 px-4 py-3"
            />
            {uploading ? (
              <p className="mt-2 text-xs text-stone-500">Enviando imagem...</p>
            ) : null}
            {form.imageUrl && !uploading ? (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="h-16 w-16 rounded-xl border border-stone-200 object-cover"
                />
                <span className="text-xs text-stone-500">Imagem selecionada</span>
              </div>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm((v) => ({ ...v, isFeatured: e.target.checked }))
              }
            />
            Produto em destaque
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((v) => ({ ...v, isActive: e.target.checked }))
              }
            />
            Produto ativo
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={saveProduct}
            disabled={loading}
            className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white"
          >
            {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-stone-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl text-stone-900">Produtos</h2>
        {products.map((product) => (
          <article key={product.id} className="rounded-2xl border border-stone-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">
                  {product.name}{" "}
                  {!product.isActive ? (
                    <span className="text-xs text-red-700">(Inativo)</span>
                  ) : null}
                </p>
                <p className="text-sm text-stone-600">
                  {product.category.name} · {formatPrice(Number(product.price))} ·
                  Estoque: {product.stock}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => inactivateProduct(product.id)}
                  className="rounded-xl border border-red-300 px-3 py-1.5 text-xs text-red-700"
                >
                  Inativar
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
