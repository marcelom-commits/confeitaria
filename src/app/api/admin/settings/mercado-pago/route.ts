import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoToken, upsertMercadoPagoToken } from "@/lib/store-settings";
import { requireAdminApi } from "@/lib/access";

export async function GET() {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const token = await getMercadoPagoToken();
  return NextResponse.json({ token });
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const body = (await request.json()) as { token?: string };
  await upsertMercadoPagoToken(body.token ?? "");
  return NextResponse.json({ ok: true });
}
