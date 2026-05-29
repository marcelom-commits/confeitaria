"use client";

import { useCallback, useEffect, useState } from "react";

export function MercadoPagoSettingsAdmin() {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings/mercado-pago")
      .then((r) => r.json())
      .then((d) => {
        setToken(d.token ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/mercado-pago", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }, [token]);

  if (loading) return null;

  return (
    <section className="rounded-2xl border border-stone-200 p-5">
      <h2 className="font-serif text-2xl text-stone-900">Mercado Pago</h2>
      <p className="mt-1 text-sm text-stone-500">
        Access Token usado para processar pagamentos com cartão, boleto e PIX via Mercado Pago.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">
            Access Token (produção)
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="APP_USR-..."
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
