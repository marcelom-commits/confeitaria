import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";

import { requireAdminApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusWhatsApp } from "@/lib/notification";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const params = await props.params;
    const body = (await request.json()) as { status: OrderStatus };
    const nextStatus = body.status;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
      },
      include: { payment: true },
    });

    if (order.payment) {
      let paymentStatus: PaymentStatus = order.payment.status;
      if (nextStatus === "PAID") paymentStatus = "APPROVED";
      if (nextStatus === "CANCELED") paymentStatus = "REJECTED";
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: paymentStatus },
      });
    }

    await sendOrderStatusWhatsApp({
      orderId: order.id,
      status: nextStatus,
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
