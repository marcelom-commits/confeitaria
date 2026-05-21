import { NextRequest, NextResponse } from "next/server";

import { buildShippingQuote } from "@/lib/checkout";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { regionId?: string };
    const regionId = body.regionId ?? "";
    const quote = await buildShippingQuote(regionId);

    return NextResponse.json({
      ok: true,
      subtotal: quote.subtotal,
      options: quote.options,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel calcular o frete.",
      },
      { status: 400 },
    );
  }
}
