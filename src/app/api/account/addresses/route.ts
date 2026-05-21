import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const userCheck = await requireUserApi();
  if ("error" in userCheck) return userCheck.error;

  try {
    const session = userCheck.session;
    const body = (await request.json()) as {
      label?: string;
      recipientName: string;
      street: string;
      number: string;
      complement?: string;
      district: string;
      city: string;
      state: string;
      zipCode: string;
      isDefault?: boolean;
    };

    const profile = await prisma.customerProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        customerProfileId: profile.id,
        label: body.label ?? null,
        recipientName: body.recipientName,
        street: body.street,
        number: body.number,
        complement: body.complement ?? null,
        district: body.district,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode.replace(/\D/g, ""),
        isDefault: Boolean(body.isDefault),
      },
    });

    return NextResponse.json({ ok: true, address });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
