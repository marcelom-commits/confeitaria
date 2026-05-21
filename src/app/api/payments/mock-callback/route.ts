import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout/falha", request.url));
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.APPROVED,
          paidAt: new Date(),
          method: "pix",
          gatewayPaymentId: `mock_${orderId}`,
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    }

    return NextResponse.redirect(
      new URL(`/checkout/sucesso?orderId=${orderId}`, request.url),
    );
  } catch {
    return NextResponse.redirect(new URL("/checkout/falha", request.url));
  }
}
