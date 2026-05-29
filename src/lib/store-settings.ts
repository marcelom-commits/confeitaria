import { prisma } from "@/lib/prisma";

export type PixSettings = {
  pixKey: string;
  pixKeyType: string;
  pixReceiver: string;
};

export async function getPixSettings(): Promise<PixSettings> {
  const rows = await prisma.storeSetting.findMany({
    where: { key: { in: ["pixKey", "pixKeyType", "pixReceiver"] } },
  });

  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    pixKey: map.get("pixKey") ?? process.env.NEXT_PUBLIC_PIX_KEY ?? "",
    pixKeyType: map.get("pixKeyType") ?? process.env.NEXT_PUBLIC_PIX_KEY_TYPE ?? "telefone",
    pixReceiver: map.get("pixReceiver") ?? process.env.NEXT_PUBLIC_PIX_RECEIVER ?? "",
  };
}

export async function upsertPixSettings(settings: PixSettings): Promise<void> {
  const entries = [
    { key: "pixKey", value: settings.pixKey },
    { key: "pixKeyType", value: settings.pixKeyType },
    { key: "pixReceiver", value: settings.pixReceiver },
  ];

  for (const entry of entries) {
    await prisma.storeSetting.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }
}

export type WhatsAppSettings = {
  phone: string;
  message: string;
};

export async function getWhatsAppSettings(): Promise<WhatsAppSettings> {
  const rows = await prisma.storeSetting.findMany({
    where: { key: { in: ["whatsappPhone", "whatsappMessage"] } },
  });

  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    phone: map.get("whatsappPhone") ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "556199999999",
    message: map.get("whatsappMessage") ?? process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? "Olá! Gostaria de saber mais sobre os produtos da Doce Encanto.",
  };
}

export async function upsertWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  const entries = [
    { key: "whatsappPhone", value: settings.phone },
    { key: "whatsappMessage", value: settings.message },
  ];

  for (const entry of entries) {
    await prisma.storeSetting.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }
}
