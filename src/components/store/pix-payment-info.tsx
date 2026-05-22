"use client";

import { useCallback, useState } from "react";

type Props = {
  pixKey: string;
  pixKeyType: string;
  pixReceiver: string;
  amount: number;
  qrCodeDataUrl?: string | null;
};

const keyTypeLabel: Record<string, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  telefone: "Telefone",
  chave_aleatoria: "Chave Aleatória",
};

export function PixPaymentInfo({ pixKey, pixKeyType, pixReceiver, amount, qrCodeDataUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = pixKey;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pixKey]);

  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
      <h3 className="text-lg font-semibold text-green-800">Pagamento PIX</h3>
      <p className="mt-1 text-sm text-green-700">
        Pague exatamente o valor abaixo usando o PIX do seu banco.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs text-green-600">Valor</p>
            <p className="text-xl font-bold text-green-900">
              {amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-white px-4 py-3">
          <p className="text-xs text-green-600">
            {keyTypeLabel[pixKeyType] ?? pixKeyType}
          </p>
          <p className="mt-0.5 font-mono text-sm font-medium text-green-900 break-all">
            {pixKey}
          </p>
        </div>

        {pixReceiver && (
          <div className="rounded-xl border border-green-200 bg-white px-4 py-3">
            <p className="text-xs text-green-600">Beneficiário</p>
            <p className="mt-0.5 font-medium text-green-900">{pixReceiver}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          {copied ? "Copiado!" : "Copiar chave PIX"}
        </button>
      </div>

      {qrCodeDataUrl && (
        <div className="mt-4 flex flex-col items-center">
          <p className="mb-2 text-sm text-green-700">Escaneie com o app do seu banco</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeDataUrl}
            alt="QR Code PIX"
            className="h-48 w-48 rounded-xl border border-green-200 bg-white"
          />
        </div>
      )}
    </div>
  );
}
