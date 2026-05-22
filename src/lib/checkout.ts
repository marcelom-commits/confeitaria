import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { clearCart, getOrCreateCart } from "@/lib/cart";
import { sendOrderStatusEmail } from "@/lib/notification";
import { prisma } from "@/lib/prisma";
import { getShippingOptionByRegion } from "@/lib/shipping";
import { createMercadoPagoPreference } from "@/lib/payment";

export type CheckoutPayload = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  shippingAddress: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    recipientName: string;
  };
  shippingOption: {
    id: string;
    name: string;
    carrier: string;
    price: number;
    days: number;
  };
  payment: {
    method: string;
  };
  notes?: string;
  shippingToken?: string;
};

export async function buildShippingQuote(regionId: string) {
  const cart = await getOrCreateCart();
  if (!cart.items.length) {
    throw new Error("Carrinho vazio.");
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.unitPrice) * item.quantity,
    0,
  );

  const option = getShippingOptionByRegion(regionId);
  return {
    cartId: cart.id,
    subtotal,
    options: [option],
  };
}

export async function createOrderAndPayment(payload: CheckoutPayload) {
  const cart = await getOrCreateCart();
  if (!cart.items.length) {
    throw new Error("Carrinho vazio.");
  }

  const session = await auth();
  const normalizedEmail = payload.customer.email.toLowerCase().trim();

  const user =
    session?.user?.id
      ? await prisma.user.findUnique({ where: { id: session.user.id } })
      : await prisma.user.findUnique({ where: { email: normalizedEmail } });

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.unitPrice) * item.quantity,
    0,
  );
  const shippingCost = Number(payload.shippingOption.price);
  const total = subtotal + shippingCost;

  const order = await prisma.$transaction(async (tx) => {
    let customerProfileId: string | null = null;
    let userId: string | null = user?.id ?? null;

    if (userId) {
      const profile = await tx.customerProfile.upsert({
        where: { userId },
        update: { phone: payload.customer.phone },
        create: { userId, phone: payload.customer.phone },
      });
      customerProfileId = profile.id;

      await tx.address.create({
        data: {
          customerProfileId,
          label: "Entrega checkout",
          recipientName: payload.shippingAddress.recipientName,
          street: payload.shippingAddress.street,
          number: payload.shippingAddress.number,
          complement: payload.shippingAddress.complement,
          district: payload.shippingAddress.district,
          city: payload.shippingAddress.city,
          state: payload.shippingAddress.state,
          zipCode: payload.shippingAddress.zipCode.replace(/\D/g, ""),
          isDefault: false,
        },
      });
    }

    if (!userId) {
      const guestUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: payload.customer.name,
          role: "CUSTOMER",
          customerProfile: {
            create: {
              phone: payload.customer.phone,
            },
          },
        },
        include: { customerProfile: true },
      });
      userId = guestUser.id;
      customerProfileId = guestUser.customerProfile?.id ?? null;
    }

    const lastOrder = await tx.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const nextNumber = (lastOrder?.orderNumber ?? 0) + 1;

    const created = await tx.order.create({
      data: {
        userId,
        customerProfileId,
        orderNumber: nextNumber,
        status: "PENDING",
        subtotal: new Prisma.Decimal(subtotal),
        shippingCost: new Prisma.Decimal(shippingCost),
        total: new Prisma.Decimal(total),
        notes: payload.notes,
        recipientName: payload.shippingAddress.recipientName,
        street: payload.shippingAddress.street,
        number: payload.shippingAddress.number,
        complement: payload.shippingAddress.complement,
        district: payload.shippingAddress.district,
        city: payload.shippingAddress.city,
        state: payload.shippingAddress.state,
        zipCode: payload.shippingAddress.zipCode.replace(/\D/g, ""),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalPrice: new Prisma.Decimal(Number(item.unitPrice) * item.quantity),
          })),
        },
        shipment: {
          create: {
            shippingMethod: payload.shippingOption.name,
            carrier: payload.shippingOption.carrier,
            shippingCost: new Prisma.Decimal(shippingCost),
            estimatedDays: payload.shippingOption.days,
            status: "PENDING",
            rawResponse: payload.shippingOption,
          },
        },
      },
      include: {
        items: true,
      },
    });

    const preference = await createMercadoPagoPreference({
      orderId: created.id,
      amount: total,
      description: `Pedido ${created.id} - Doce Encanto`,
      payer: {
        email: normalizedEmail,
        name: payload.customer.name,
      },
      paymentMethods: payload.payment.method,
    });

    await tx.payment.create({
      data: {
        orderId: created.id,
        gateway: "MERCADO_PAGO",
        gatewayPaymentId: preference.id,
        method: payload.payment.method,
        amount: new Prisma.Decimal(total),
        status: PaymentStatus.PENDING,
        rawResponse: {
          ...(preference.raw as Record<string, unknown>),
          initPoint: preference.initPoint,
          isMock: preference.isMock,
        } as Prisma.JsonObject,
      },
    });

    await clearCart(cart.id);

    if (payload.shippingToken) {
      await tx.shippingToken.update({
        where: { token: payload.shippingToken },
        data: { isUsed: true, orderId: created.id, usedAt: new Date() },
      });
    }

    return {
      order: created,
      paymentPreference: preference,
      totals: {
        subtotal,
        shippingCost,
        total,
      },
    };
  });

  return order;
}

export async function updateOrderFromMercadoPagoWebhook(input: {
  preferenceId?: string | null;
  status?: string | null;
  paymentType?: string | null;
  paymentMethodId?: string | null;
  raw: unknown;
}) {
  if (!input.preferenceId) {
    return null;
  }

  const payment = await prisma.payment.findUnique({
    where: { gatewayPaymentId: input.preferenceId },
    include: { order: true },
  });

  if (!payment) {
    return null;
  }

  let mappedPaymentStatus: PaymentStatus = "PENDING";
  let mappedOrderStatus: OrderStatus = OrderStatus.PENDING;

  const status = (input.status ?? "").toLowerCase();
  if (status === "approved" || status === "accredited") {
    mappedPaymentStatus = PaymentStatus.APPROVED;
    mappedOrderStatus = OrderStatus.PAID;
  } else if (status === "rejected" || status === "cancelled") {
    mappedPaymentStatus = PaymentStatus.REJECTED;
    mappedOrderStatus = OrderStatus.CANCELED;
  } else if (status === "refunded") {
    mappedPaymentStatus = PaymentStatus.REFUNDED;
    mappedOrderStatus = OrderStatus.CANCELED;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedPaymentStatus,
        method: input.paymentMethodId ?? input.paymentType ?? payment.method,
        paidAt:
          mappedPaymentStatus === PaymentStatus.APPROVED
            ? new Date()
            : payment.paidAt ?? null,
        rawResponse: input.raw as Prisma.JsonObject,
      },
      include: {
        order: true,
      },
    });

    const updatedOrder = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: mappedOrderStatus,
      },
    });

    return { updatedPayment, updatedOrder };
  });

  const orderUser = await prisma.user.findUnique({
    where: { id: updated.updatedOrder.userId ?? "" },
    select: { email: true },
  });

  if (orderUser?.email) {
    await sendOrderStatusEmail({
      orderId: updated.updatedOrder.id,
      to: orderUser.email,
      status: updated.updatedOrder.status,
      amount: Number(updated.updatedOrder.total),
    });
  }

  return updated;
}
