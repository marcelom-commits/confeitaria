"use client";

import { useEffect, useState } from "react";

export default function AdminTestPage() {
  const [result, setResult] = useState<string>("carregando...");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setResult(JSON.stringify(data, null, 2)))
      .catch((err) => setResult("ERRO: " + err.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-4 text-xl font-bold">Teste de Sessão</h1>
      <pre className="rounded-lg bg-stone-100 p-4 text-sm">{result}</pre>
    </div>
  );
}
