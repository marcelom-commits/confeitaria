"use client";

import { useMemo, useState } from "react";

import { deliveryRegions } from "@/lib/shipping";
import { formatPrice } from "@/lib/format";

type CartItem = {
  id: string;
  productName: string;
  quantity: number;
  lineTotal: number;
};

type ShippingOption = {
  id: string;
  name: string;
  carrier: string;
  price: number;
  days: number;
  isMock: boolean;
};

type Props = {
  items: CartItem[];
  subtotal: number;
};

const steps = [
  "Identificacao",
  "Endereco",
  "Frete",
  "Pagamento",
  "Revisao",
] as const;

export function CheckoutFlow({ items, subtotal }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [tokenCode, setTokenCode] = useState("");
  const [validatedToken, setValidatedToken] = useState<{ token: string; price: number } | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const selectedShipping: ShippingOption | null = useMemo(() => {
    if (!selectedRegionId) return null;
    const region = deliveryRegions.find((r) => r.id === selectedRegionId);
    if (!region) return null;
    if (region.id === "outra") {
      if (validatedToken) {
        return {
          id: "outra-token",
          name: "Entrega orçada via WhatsApp",
          carrier: "Entrega própria",
          price: validatedToken.price,
          days: 0,
          isMock: false,
        };
      }
      return {
        id: "outra",
        name: region.label,
        carrier: "Entrega própria",
        price: 0,
        days: 0,
        isMock: false,
      };
    }
    return {
      id: region.id,
      name: `Entrega para ${region.label.split(",")[0]}`,
      carrier: "Entrega própria",
      price: region.price,
      days: region.days,
      isMock: false,
    };
  }, [selectedRegionId, validatedToken]);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
  });
  const [address, setAddress] = useState({
    recipientName: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const [notes, setNotes] = useState("");
  const total = subtotal + (selectedShipping?.price ?? 0);

  function validateStep(): string | null {
    if (step === 0) {
      if (!customer.name.trim()) return "Informe o nome completo.";
      if (!customer.email.trim()) return "Informe o email.";
    }
    if (step === 1) {
      if (!address.recipientName.trim()) return "Informe o nome do recebedor.";
      if (!address.zipCode.trim()) return "Informe o CEP.";
      if (!address.street.trim()) return "Informe a rua.";
      if (!address.number.trim()) return "Informe o numero.";
      if (!address.district.trim()) return "Informe o bairro.";
      if (!address.city.trim()) return "Informe a cidade.";
      if (!address.state.trim()) return "Informe o UF.";
    }
    if (step === 2 && !selectedRegionId) {
      return "Selecione uma regiao de entrega.";
    }
    if (step === 2 && selectedRegionId === "outra" && !validatedToken) {
      return "Valide o token recebido no WhatsApp para continuar.";
    }
    return null;
  }

  function next() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleValidateToken() {
    setTokenLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/shipping/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenCode }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        token?: string;
        price?: number;
      };
      if (!response.ok || !data.ok || !data.token) {
        throw new Error(data.message ?? "Token invalido.");
      }
      setValidatedToken({ token: data.token, price: data.price! });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
      setValidatedToken(null);
    } finally {
      setTokenLoading(false);
    }
  }

  async function placeOrder() {
    if (!selectedShipping) {
      setError("Selecione um frete para continuar.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          shippingAddress: address,
          shippingOption: selectedShipping,
          payment: { method: paymentMethod },
          notes,
          shippingToken: validatedToken?.token,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        orderId?: string;
        payment?: { initPoint?: string };
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Nao foi possivel finalizar o pedido.");
      }
      if (data.payment?.initPoint) {
        window.location.href = data.payment.initPoint;
        return;
      }
      window.location.href = `/checkout/sucesso?orderId=${data.orderId ?? ""}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-2 sm:grid-cols-5">
        {steps.map((label, index) => (
          <div
            key={label}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              index === step
                ? "border-rose-600 bg-rose-50 text-rose-700"
                : "border-stone-200 text-stone-500"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-stone-900">Identificacao</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-xl border border-stone-300 px-4 py-3"
              placeholder="Nome completo"
              value={customer.name}
              onChange={(e) => setCustomer((v) => ({ ...v, name: e.target.value }))}
            />
            <input
              className="rounded-xl border border-stone-300 px-4 py-3"
              placeholder="Email"
              value={customer.email}
              onChange={(e) => setCustomer((v) => ({ ...v, email: e.target.value }))}
            />
            <input
              className="rounded-xl border border-stone-300 px-4 py-3"
              placeholder="Telefone"
              value={customer.phone}
              onChange={(e) => setCustomer((v) => ({ ...v, phone: e.target.value }))}
            />
            <input
              className="rounded-xl border border-stone-300 px-4 py-3"
              placeholder="CPF (opcional)"
              value={customer.document}
              onChange={(e) => setCustomer((v) => ({ ...v, document: e.target.value }))}
            />
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-stone-900">Endereco de entrega</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Nome do recebedor" value={address.recipientName} onChange={(e) => setAddress((v) => ({ ...v, recipientName: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="CEP (somente numeros)" value={address.zipCode} onChange={(e) => setAddress((v) => ({ ...v, zipCode: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3 sm:col-span-2" placeholder="Rua" value={address.street} onChange={(e) => setAddress((v) => ({ ...v, street: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Numero" value={address.number} onChange={(e) => setAddress((v) => ({ ...v, number: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Complemento (opcional)" value={address.complement} onChange={(e) => setAddress((v) => ({ ...v, complement: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Bairro" value={address.district} onChange={(e) => setAddress((v) => ({ ...v, district: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Cidade" value={address.city} onChange={(e) => setAddress((v) => ({ ...v, city: e.target.value }))} />
            <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="UF" value={address.state} onChange={(e) => setAddress((v) => ({ ...v, state: e.target.value }))} />
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-stone-900">Regiao de entrega</h2>
          <p className="text-sm text-stone-600">
            Selecione a regiao onde deseja receber o pedido. A entrega e feita pela propria loja.
          </p>
          <div className="space-y-3">
            {deliveryRegions.map((region) => (
              <label
                key={region.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                  selectedRegionId === region.id
                    ? "border-rose-600 bg-rose-50"
                    : "border-stone-200"
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold text-stone-900">{region.label}</p>
                  {region.id !== "outra" ? (
                    <p className="text-sm text-stone-600">
                      Entrega propria
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {region.id !== "outra" ? (
                    <span className="font-semibold text-stone-900">
                      {formatPrice(region.price)}
                    </span>
                  ) : (
                    <span className="text-sm text-stone-600">Orçamento</span>
                  )}
                  <input
                    type="radio"
                    name="region"
                    checked={selectedRegionId === region.id}
                    onChange={() => setSelectedRegionId(region.id)}
                  />
                </div>
              </label>
            ))}
          </div>
          {selectedRegionId === "outra" ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Para esta localidade, entre em contato pelo WhatsApp para fazer um orçamento de entrega.
                {" "}
                <a
                  href="https://wa.me/5561995536663"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  Falar no WhatsApp
                </a>
              </div>

              {validatedToken ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  Token validado! Frete: <strong>{formatPrice(validatedToken.price)}</strong>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Token de entrega
                    </label>
                    <input
                      className="w-full rounded-xl border border-stone-300 px-4 py-3"
                      placeholder="Cole o token recebido"
                      value={tokenCode}
                      onChange={(e) => setTokenCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleValidateToken}
                    disabled={tokenLoading || !tokenCode.trim()}
                    className="h-fit shrink-0 rounded-xl bg-stone-900 px-5 py-3 text-sm text-white disabled:opacity-50"
                  >
                    {tokenLoading ? "Validando..." : "Validar"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-stone-900">Pagamento</h2>
          <p className="text-sm text-stone-600">
            Selecione a forma de pagamento.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: "pix", label: "Pix" },
              { value: "card", label: "Cartao" },
              { value: "boleto", label: "Boleto" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 ${
                  paymentMethod === opt.value
                    ? "border-rose-600 bg-rose-50"
                    : "border-stone-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-stone-900">Revisao do pedido</h2>
          <div className="space-y-3 rounded-2xl border border-stone-200 p-5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-stone-700">
                  {item.productName} x {item.quantity}
                </span>
                <span className="font-semibold text-stone-900">
                  {formatPrice(item.lineTotal)}
                </span>
              </div>
            ))}
            <div className="border-t border-stone-200 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Frete</span>
                <span>{formatPrice(selectedShipping?.price ?? 0)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <textarea
            placeholder="Observacoes para entrega (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center justify-between border-t border-stone-200 pt-6">
        <button
          type="button"
          onClick={prev}
          disabled={step === 0 || loading}
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm"
        >
          Voltar
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={loading}
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm text-white"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={placeOrder}
            disabled={loading}
            className="rounded-xl bg-rose-700 px-5 py-2.5 text-sm text-white"
          >
            {loading ? "Processando..." : "Finalizar e pagar"}
          </button>
        )}
      </div>
    </div>
  );
}
