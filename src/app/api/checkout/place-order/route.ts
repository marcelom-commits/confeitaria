import { NextRequest, NextResponse } from "next/server";

import { createOrderAndPayment } from "@/lib/checkout";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createOrderAndPayment(payload);

    return NextResponse.json({
      ok: true,
      orderId: result.order.id,
      totals: result.totals,
      payment: {
        preferenceId: result.paymentPreference.id,
        initPoint: result.paymentPreference.initPoint,
        isMock: result.paymentPreference.isMock,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel finalizar checkout.",
      },
      { status: 400 },
    );
  }
}
