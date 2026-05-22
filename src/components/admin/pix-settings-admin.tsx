"use client";

import { useCallback, useEffect, useState } from "react";

type PixData = {
  pixKey: string;
  pixKeyType: string;
  pixReceiver: string;
};

export function PixSettingsAdmin() {
  const [data, setData] = useState<PixData>({
    pixKey: "",
    pixKeyType: "telefone",
    pixReceiver: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings/pix")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/pix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }, [data]);

  if (loading) return null;

  return (
    <section className="rounded-2xl border border-stone-200 p-5">
      <h2 className="font-serif text-2xl text-stone-900">Chave PIX</h2>
      <p className="mt-1 text-sm text-stone-500">
        Esta chave é usada em todos os pedidos pendentes com PIX.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Chave PIX
          </label>
          <input
            type="text"
            value={data.pixKey}
            onChange={(e) => setData({ ...data, pixKey: e.target.value })}
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Tipo da chave
          </label>
          <select
            value={data.pixKeyType}
            onChange={(e) => setData({ ...data, pixKeyType: e.target.value })}
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
          >
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="chave_aleatoria">Chave Aleatória</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Beneficiário
          </label>
          <input
            type="text"
            value={data.pixReceiver}
            onChange={(e) => setData({ ...data, pixReceiver: e.target.value })}
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-rose-600 px-6 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
        </button>
      </div>
    </section>
  );
}
