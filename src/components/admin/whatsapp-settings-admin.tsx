"use client";

import { useCallback, useEffect, useState } from "react";

type WhatsAppData = {
  phone: string;
  message: string;
};

export function WhatsAppSettingsAdmin() {
  const [data, setData] = useState<WhatsAppData>({
    phone: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings/whatsapp")
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
      const res = await fetch("/api/admin/settings/whatsapp", {
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

  const waUrl = `https://wa.me/${data.phone.replace(/\D/g, "")}?text=${encodeURIComponent(data.message)}`;

  return (
    <section className="rounded-2xl border border-stone-200 p-5">
      <h2 className="font-serif text-2xl text-stone-900">WhatsApp</h2>
      <p className="mt-1 text-sm text-stone-500">
        Número usado no ícone do WhatsApp no site.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Número (com código do país, ex: 556199999999)
          </label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Mensagem padrão
          </label>
          <textarea
            rows={3}
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
          />
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 text-xs text-stone-500 break-all">
          Link gerado: {waUrl}
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
