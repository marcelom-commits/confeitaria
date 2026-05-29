import { randomUUID } from "node:crypto";
import { getMercadoPagoToken, getPixSettings } from "@/lib/store-settings";

type MercadoPagoPreferenceInput = {
  orderId: string;
  amount: number;
  description: string;
  payer: {
    email: string;
    name?: string;
  };
  paymentMethods?: string;
};

type MercadoPagoPreferenceResult = {
  id: string;
  initPoint: string;
  sandboxInitPoint?: string;
  isMock: boolean;
  raw: unknown;
};

export async function createMercadoPagoPreference(
  input: MercadoPagoPreferenceInput,
): Promise<MercadoPagoPreferenceResult> {
  const token = await getMercadoPagoToken();

  if (!token && input.paymentMethods === "pix") {
    const pixSettings = await getPixSettings();
    const pixKey = pixSettings.pixKey || "nao definida";
    const pixKeyType = pixSettings.pixKeyType;
    const pixReceiver = pixSettings.pixReceiver;
    return {
      id: `pix_${input.orderId}`,
      initPoint: "",
      isMock: true,
      raw: {
        method: "pix",
        pixKey,
        pixKeyType,
        pixReceiver,
        amount: input.amount,
        orderId: input.orderId,
      },
    };
  }

  if (!token) {
    const fakeId = `mp_mock_${randomUUID()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      id: fakeId,
      initPoint: `${baseUrl}/api/payments/mock-callback?orderId=${input.orderId}`,
      isMock: true,
      raw: { mocked: true },
    };
  }

  const excludedPaymentTypes: Array<{ id: string }> = [];
  if (input.paymentMethods === "pix") {
    excludedPaymentTypes.push({ id: "ticket" }, { id: "credit_card" }, { id: "debit_card" });
  } else if (input.paymentMethods === "card") {
    excludedPaymentTypes.push({ id: "bank_transfer" }, { id: "ticket" });
  } else if (input.paymentMethods === "boleto") {
    excludedPaymentTypes.push({ id: "bank_transfer" }, { id: "credit_card" }, { id: "debit_card" });
  }

  const body = {
    items: [
      {
        id: input.orderId,
        title: input.description,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(input.amount.toFixed(2)),
      },
    ],
    payer: {
      email: input.payer.email,
      name: input.payer.name,
    },
    external_reference: input.orderId,
    metadata: {
      orderId: input.orderId,
    },
    payment_methods: {
      excluded_payment_types: excludedPaymentTypes,
      installments: 12,
      default_installments: 1,
    },
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/sucesso`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/falha`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout/pendente`,
    },
    auto_return: "approved",
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/mercadopago`,
  };

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Falha ao criar preferencia no Mercado Pago: ${txt}`);
  }

  const data = (await response.json()) as {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };

  return {
    id: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point,
    isMock: false,
    raw: data,
  };
}

export function normalizePaymentMethod(
  paymentType?: string | null,
  paymentMethodId?: string | null,
) {
  if (!paymentType && !paymentMethodId) return "unknown";
  const type = (paymentType ?? "").toLowerCase();
  const method = (paymentMethodId ?? "").toLowerCase();

  if (type.includes("bank_transfer") || method.includes("pix")) return "pix";
  if (type.includes("ticket") || method.includes("bol")) return "boleto";
  if (type.includes("credit_card") || type.includes("debit_card")) return "cartao";
  return paymentMethodId ?? paymentType ?? "unknown";
}
