import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { registerCustomer } from "@/lib/register";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(1, "Telefone é obrigatório."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    await registerCustomer(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Erro no cadastro.",
      },
      { status: 400 },
    );
  }
}
