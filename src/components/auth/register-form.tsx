"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Falha no cadastro.");
      return;
    }

    setMessage("Cadastro realizado com sucesso. Faça login.");
    router.push("/login");
  }

  return (
    <form action={onSubmit} className="mt-6 space-y-4">
      <input
        name="name"
        required
        placeholder="Nome completo"
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="seu@email.com"
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Crie uma senha"
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />
      <input
        name="phone"
        placeholder="Telefone (opcional)"
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />
      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-stone-900 px-4 py-3 text-white disabled:opacity-60"
      >
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}
