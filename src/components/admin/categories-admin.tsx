"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  initialCategories: Category[];
};

export function CategoriesAdmin({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    sortOrder: 0,
    isActive: true,
  });

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      imageUrl: "",
      sortOrder: 0,
      isActive: true,
    });
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description ?? "",
      imageUrl: category.imageUrl ?? "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
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

  async function saveCategory() {
    setLoading(true);
    setMessage(null);
    const isEdit = Boolean(editingId);
    const response = await fetch(
      isEdit ? `/api/admin/categories/${editingId}` : "/api/admin/categories",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          imageUrl: form.imageUrl || undefined,
          sortOrder: Number(form.sortOrder || 0),
          isActive: form.isActive,
        }),
      },
    );
    const data = (await response.json()) as {
      ok: boolean;
      message?: string;
      category?: Category;
    };
    setLoading(false);
    if (!response.ok || !data.ok || !data.category) {
      setMessage(data.message ?? "Nao foi possivel salvar categoria.");
      return;
    }
    if (isEdit) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === data.category!.id ? data.category! : cat)),
      );
      setMessage("Categoria atualizada.");
    } else {
      setCategories((prev) => [data.category!, ...prev]);
      setMessage("Categoria criada.");
    }
    resetForm();
  }

  async function inactivateCategory(id: string) {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { ok: boolean; message?: string };
    setLoading(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message ?? "Falha ao inativar categoria.");
      return;
    }
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, isActive: false } : cat)),
    );
    setMessage("Categoria inativada.");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 p-5">
        <h2 className="font-serif text-2xl text-stone-900">
          {editingId ? "Editar categoria" : "Nova categoria"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            className="rounded-xl border border-stone-300 px-4 py-3"
          />
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              Imagem da categoria
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
          <input
            placeholder="Descricao"
            value={form.description}
            onChange={(e) =>
              setForm((v) => ({ ...v, description: e.target.value }))
            }
            className="rounded-xl border border-stone-300 px-4 py-3 sm:col-span-2"
          />
          <input
            type="number"
            placeholder="Ordem"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((v) => ({ ...v, sortOrder: Number(e.target.value || 0) }))
            }
            className="rounded-xl border border-stone-300 px-4 py-3"
          />
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((v) => ({ ...v, isActive: e.target.checked }))
              }
            />
            Categoria ativa
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={saveCategory}
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
        <h2 className="font-serif text-2xl text-stone-900">Categorias</h2>
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-2xl border border-stone-200 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">
                  {category.name}{" "}
                  {!category.isActive ? (
                    <span className="text-xs text-red-700">(Inativa)</span>
                  ) : null}
                </p>
                <p className="text-sm text-stone-600">
                  {category.description ?? "Sem descricao"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => editCategory(category)}
                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => inactivateCategory(category.id)}
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
