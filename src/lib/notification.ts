import { prisma } from "@/lib/prisma";
import { orderStatusLabels, formatOrderNumber, formatPrice } from "@/lib/format";

type SendWhatsAppInput = {
  to: string;
  message: string;
};

async function sendWhatsAppMessage(input: SendWhatsAppInput) {
  const [tokenRow, phoneIdRow] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { key: "whatsappApiToken" } }),
    prisma.storeSetting.findUnique({ where: { key: "whatsappPhoneId" } }),
  ]);

  const token = tokenRow?.value ?? process.env.WHATSAPP_API_TOKEN ?? "";
  const phoneId = phoneIdRow?.value ?? process.env.WHATSAPP_PHONE_ID ?? "";

  if (!token || !phoneId) {
    console.log("[whatsapp-mock] API não configurada. Mensagem não enviada.");
    console.log(`[whatsapp-mock] para=${input.to} | msg=${input.message}`);
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: input.to.replace(/\D/g, ""),
          type: "text",
          text: { body: input.message },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("[whatsapp-error]", err);
    }
  } catch (error) {
    console.error("[whatsapp-error]", error);
  }
}

function buildStatusMessage(
  status: string,
  orderNumber: number,
  amount: number,
): string {
  const statusLabel = orderStatusLabels[status] ?? status;
  const formattedNumber = formatOrderNumber(orderNumber);
  const formattedAmount = formatPrice(amount);

  const messages: Record<string, string> = {
    PENDING: `Olá! Recebemos seu pedido ${formattedNumber} no valor de ${formattedAmount}. Estamos aguardando a confirmação do pagamento. Assim que for aprovado, avisamos você!`,
    PAID: `Boas notícias! O pagamento do seu pedido ${formattedNumber} foi aprovado! Agora vamos preparar seus produtos com todo carinho.`,
    PREPARING: `Seu pedido ${formattedNumber} já está sendo preparado! Em breve enviaremos atualizações sobre o envio.`,
    SHIPPED: `Seu pedido ${formattedNumber} saiu para entrega! Fique de olho para receber.`,
    DELIVERED: `Seu pedido ${formattedNumber} foi entregue! Esperamos que aproveite. Qualquer dúvida, estamos por aqui.`,
    CANCELED: `Seu pedido ${formattedNumber} foi cancelado. Se tiver alguma dúvida, entre em contato conosco.`,
  };

  return messages[status] ?? `Seu pedido ${formattedNumber} foi atualizado para: ${statusLabel}.`;
}

export async function sendOrderStatusWhatsApp(input: {
  orderId: string;
  status: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      customerProfile: true,
      user: { include: { customerProfile: true } },
    },
  });

  if (!order) return;

  const phone =
    order.customerProfile?.phone ?? order.user?.customerProfile?.phone;

  if (!phone) {
    console.log("[whatsapp] Cliente sem telefone cadastrado.");
    return;
  }

  const message = buildStatusMessage(
    input.status,
    order.orderNumber,
    Number(order.total),
  );

  await sendWhatsAppMessage({ to: phone, message });
}
