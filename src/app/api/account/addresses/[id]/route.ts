import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const userCheck = await requireUserApi();
  if ("error" in userCheck) return userCheck.error;

  try {
    const session = userCheck.session;
    const params = await props.params;
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

    const existing = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerProfile: { userId: session.user.id },
      },
      include: { customerProfile: true },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Endereco nao encontrado." },
        { status: 404 },
      );
    }

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { customerProfileId: existing.customerProfileId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: existing.id },
      data: {
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

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const userCheck = await requireUserApi();
  if ("error" in userCheck) return userCheck.error;

  try {
    const session = userCheck.session;
    const params = await props.params;
    const existing = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerProfile: { userId: session.user.id },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Endereco nao encontrado." },
        { status: 404 },
      );
    }

    await prisma.address.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Erro." },
      { status: 400 },
    );
  }
}
