"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Credenciais inválidas.");
      return;
    }

    router.push("/catalogo");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="mt-6 space-y-4">
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
        placeholder="Sua senha"
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-stone-900 px-4 py-3 text-white disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
