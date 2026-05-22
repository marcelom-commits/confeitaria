const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient();

  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY;
  const pixKeyType = process.env.NEXT_PUBLIC_PIX_KEY_TYPE;
  const pixReceiver = process.env.NEXT_PUBLIC_PIX_RECEIVER;

  if (pixKey) {
    await p.storeSetting.upsert({
      where: { key: "pixKey" },
      update: { value: pixKey },
      create: { key: "pixKey", value: pixKey },
    });
  }
  if (pixKeyType) {
    await p.storeSetting.upsert({
      where: { key: "pixKeyType" },
      update: { value: pixKeyType },
      create: { key: "pixKeyType", value: pixKeyType },
    });
  }
  if (pixReceiver) {
    await p.storeSetting.upsert({
      where: { key: "pixReceiver" },
      update: { value: pixReceiver },
      create: { key: "pixReceiver", value: pixReceiver },
    });
  }

  console.log("Store settings seeded from env vars");
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
