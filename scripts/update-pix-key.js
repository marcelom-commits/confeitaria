const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.storeSetting.upsert({
    where: { key: "pixKey" },
    update: { value: "+5561993762268" },
    create: { key: "pixKey", value: "+5561993762268" },
  });
  console.log("DB updated");
  await p.$disconnect();
})();
