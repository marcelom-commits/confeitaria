"use client";

import { useCallback, useEffect, useState } from "react";

type WhatsAppData = {
  phone: string;
  message: string;
  zapiInstanceId: string;
  zapiToken: string;
};

export function WhatsAppSettingsAdmin() {
  const [data, setData] = useState<WhatsAppData>({
    phone: "",
    message: "",
    zapiInstanceId: "",
    zapiToken: "",
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
        Botão flutuante e notificações automáticas de pedidos.
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

        <details className="rounded-xl border border-stone-200">
          <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 hover:text-stone-700">
            Configuração da API de Notificação (Z-API)
          </summary>
          <div className="space-y-3 border-t border-stone-200 p-4">
            <p className="text-xs text-stone-400">
              Para enviar notificações automáticas de status de pedidos, configure
              sua instância do Z-API. Deixe em branco para usar apenas o botão
              flutuante.
            </p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
                Instance ID (Z-API)
              </label>
              <input
                type="text"
                value={data.zapiInstanceId}
                onChange={(e) => setData({ ...data, zapiInstanceId: e.target.value })}
                placeholder="3A7B9C1D2E4F..."
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
                Token (Z-API)
              </label>
              <input
                type="password"
                value={data.zapiToken}
                onChange={(e) => setData({ ...data, zapiToken: e.target.value })}
                placeholder="seu-token-zapi"
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2 text-sm"
              />
            </div>
          </div>
        </details>

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
