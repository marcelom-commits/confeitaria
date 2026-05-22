import { NextRequest, NextResponse } from "next/server";
import { getPixSettings, upsertPixSettings } from "@/lib/store-settings";
import { requireAdminApi } from "@/lib/access";

export async function GET() {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const settings = await getPixSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  const body = (await request.json()) as {
    pixKey?: string;
    pixKeyType?: string;
    pixReceiver?: string;
  };

  const current = await getPixSettings();

  await upsertPixSettings({
    pixKey: body.pixKey ?? current.pixKey,
    pixKeyType: body.pixKeyType ?? current.pixKeyType,
    pixReceiver: body.pixReceiver ?? current.pixReceiver,
  });

  return NextResponse.json({ ok: true });
}
