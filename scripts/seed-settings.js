const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const entries = [
    { key: "pixKey", value: "61993762268" },
    { key: "pixKeyType", value: "telefone" },
    { key: "pixReceiver", value: "Doce Encanto Confeitaria" },
  ];
  for (const e of entries) {
    await p.storeSetting.upsert({
      where: { key: e.key },
      update: { value: e.value },
      create: { key: e.key, value: e.value },
    });
  }
  console.log("Seeded");
  await p.$disconnect();
})();
