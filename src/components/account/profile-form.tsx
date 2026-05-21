"use client";

import { useState } from "react";

type Props = {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
};

export function ProfileForm({ initialName, initialEmail, initialPhone }: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };
    const response = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { ok: boolean; message?: string };
    setLoading(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message ?? "Nao foi possivel atualizar perfil.");
      return;
    }
    setMessage("Perfil atualizado com sucesso.");
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
          Nome
        </label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
          E-mail
        </label>
        <input
          value={initialEmail}
          disabled
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
          Telefone
        </label>
        <input
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm text-white"
      >
        {loading ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}
