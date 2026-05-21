import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/access";
import { saveBase64Image } from "@/lib/upload";

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdminApi();
  if ("error" in adminCheck) return adminCheck.error;

  try {
    const body = (await request.json()) as { imageBase64?: string };
    if (!body.imageBase64) {
      return NextResponse.json(
        { ok: false, message: "Imagem obrigatoria." },
        { status: 400 },
      );
    }

    const url = await saveBase64Image(body.imageBase64);
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
