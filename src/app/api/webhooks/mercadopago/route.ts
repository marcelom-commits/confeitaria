import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getMercadoPagoToken } from "@/lib/store-settings";
import { sendOrderStatusWhatsApp } from "@/lib/notification";

async function getPaymentDetails(paymentId: string) {
  const token = await getMercadoPagoToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    return (await response.json()) as {
      id: string;
      status: string;
      payment_type_id: string;
      payment_method_id: string;
      external_reference?: string;
    } | null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
      id?: string | number;
      status?: string;
      payment_type_id?: string;
      payment_method_id?: string;
      external_reference?: string;
    };

    const paymentId = String(body.data?.id ?? body.id ?? "");

    let orderId = body.external_reference ?? "";

    if (paymentId && !orderId) {
      const details = await getPaymentDetails(paymentId);
      if (details?.external_reference) {
        orderId = details.external_reference;
      }
    }

    if (!orderId) {
      return NextResponse.json({ ok: false, reason: "no_order_id" });
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      return NextResponse.json({ ok: false, reason: "payment_not_found" });
    }

    const status = (body.status ?? "").toLowerCase();
    const details = paymentId
      ? await getPaymentDetails(paymentId)
      : null;
    const actualStatus = details?.status ?? status;
    const paymentTypeId = body.payment_type_id ?? details?.payment_type_id ?? null;
    const paymentMethodId = body.payment_method_id ?? details?.payment_method_id ?? null;

    let mappedPaymentStatus: PaymentStatus = PaymentStatus.PENDING;
    let mappedOrderStatus: OrderStatus = OrderStatus.PENDING;

    if (actualStatus === "approved" || actualStatus === "accredited") {
      mappedPaymentStatus = PaymentStatus.APPROVED;
      mappedOrderStatus = OrderStatus.PAID;
    } else if (actualStatus === "rejected" || actualStatus === "cancelled") {
      mappedPaymentStatus = PaymentStatus.REJECTED;
      mappedOrderStatus = OrderStatus.CANCELED;
    } else if (actualStatus === "refunded") {
      mappedPaymentStatus = PaymentStatus.REFUNDED;
      mappedOrderStatus = OrderStatus.CANCELED;
    }

    const method =
      paymentTypeId?.includes("bank_transfer") || paymentMethodId?.includes("pix")
        ? "pix"
        : paymentTypeId?.includes("ticket") || paymentMethodId?.includes("bol")
          ? "boleto"
          : paymentTypeId?.includes("credit_card") || paymentTypeId?.includes("debit_card")
            ? "cartao"
            : paymentMethodId ?? paymentTypeId ?? "unknown";

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedPaymentStatus,
        method,
        gatewayPaymentId: paymentId || payment.gatewayPaymentId,
        paidAt:
          mappedPaymentStatus === PaymentStatus.APPROVED
            ? new Date()
            : payment.paidAt ?? null,
        rawResponse: details ?? body,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: mappedOrderStatus },
    });

    await sendOrderStatusWhatsApp({
      orderId,
      status: mappedOrderStatus,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Falha ao processar webhook Mercado Pago.",
      },
      { status: 400 },
    );
  }
}
