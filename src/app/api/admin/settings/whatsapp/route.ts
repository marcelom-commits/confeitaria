import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppSettings, upsertWhatsAppSettings } from "@/lib/store-settings";
import { requireAdminApi } from "@/lib/access";

export async function GET() {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const settings = await getWhatsAppSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const body = (await request.json()) as {
    phone?: string;
    message?: string;
    apiToken?: string;
    phoneId?: string;
  };

  const current = await getWhatsAppSettings();

  await upsertWhatsAppSettings({
    phone: body.phone ?? current.phone,
    message: body.message ?? current.message,
    apiToken: body.apiToken ?? current.apiToken,
    phoneId: body.phoneId ?? current.phoneId,
  });

  return NextResponse.json({ ok: true });
}
