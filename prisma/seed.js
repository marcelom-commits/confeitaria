const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const categories = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "Bolos",
        slug: "bolos",
        description: "Bolos artesanais para festas e datas especiais.",
        imageUrl:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Doces finos",
        slug: "doces-finos",
        description: "Brigadeiros, trufas e doces gourmet.",
        imageUrl:
          "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kits presenteaveis",
        slug: "kits-presenteaveis",
        description: "Combinacoes especiais para presentear.",
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 3,
      },
    }),
  ]);

  const [bolos, doces, kits] = categories;

  const products = [
    {
      name: "Bolo Red Velvet Premium",
      slug: "bolo-red-velvet-premium",
      description: "Massa aveludada com recheio leve de cream cheese.",
      price: "169.90",
      stock: 10,
      categoryId: bolos.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80",
      variants: [
        { name: "1kg", stock: 6, price: "169.90", sku: "BRV-1KG" },
        { name: "2kg", stock: 4, price: "289.90", sku: "BRV-2KG" },
      ],
    },
    {
      name: "Bolo de Cenoura com Brigadeiro",
      slug: "bolo-cenoura-brigadeiro",
      description: "Classico brasileiro com cobertura cremosa.",
      price: "139.90",
      stock: 14,
      categoryId: bolos.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
      variants: [{ name: "1kg", stock: 10, price: "139.90", sku: "BCB-1KG" }],
    },
    {
      name: "Caixa com 24 Brigadeiros",
      slug: "caixa-24-brigadeiros",
      description: "Sabores classicos e gourmet com acabamento artesanal.",
      price: "74.90",
      stock: 40,
      categoryId: doces.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1511381939415-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      variants: [
        { name: "Sortidos", stock: 20, price: "74.90", sku: "CB24-SORT" },
        { name: "Tradicionais", stock: 20, price: "69.90", sku: "CB24-TRAD" },
      ],
    },
    {
      name: "Kit Cafe e Afeto",
      slug: "kit-cafe-afeto",
      description: "Selecao de mini bolo, doces e mimo especial para presente.",
      price: "129.90",
      stock: 12,
      categoryId: kits.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
      variants: [{ name: "Padrao", stock: 12, price: "129.90", sku: "KCA-PAD" }],
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        isFeatured: p.isFeatured,
        images: {
          create: [{ url: p.image, alt: p.name, sortOrder: 1 }],
        },
        variants: {
          create: p.variants.map((variant) => ({
            name: variant.name,
            stock: variant.stock,
            price: variant.price,
            sku: variant.sku,
          })),
        },
      },
    });
  }

  const customerPassword = await bcrypt.hash("123456", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const customer = await prisma.user.create({
    data: {
      email: "cliente@doceencanto.com.br",
      passwordHash: customerPassword,
      name: "Cliente Demo",
      role: "CUSTOMER",
      customerProfile: {
        create: {
          phone: "11999990000",
          addresses: {
            create: [
              {
                label: "Casa",
                recipientName: "Cliente Demo",
                street: "Rua das Flores",
                number: "120",
                district: "Centro",
                city: "Sao Paulo",
                state: "SP",
                zipCode: "01001000",
                isDefault: true,
              },
            ],
          },
        },
      },
    },
    include: { customerProfile: true },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@doceencanto.com.br",
      passwordHash: adminPassword,
      name: "Admin Doce Encanto",
      role: "ADMIN",
      adminUser: {
        create: {
          title: "Gerente",
          permissions: ["products:write", "orders:write", "customers:read"],
        },
      },
    },
  });

  const firstProduct = await prisma.product.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (customer && firstProduct) {
    const cart = await prisma.cart.create({
      data: {
        userId: customer.id,
      },
    });

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: firstProduct.id,
        quantity: 1,
        unitPrice: firstProduct.price,
      },
    });
  }

  console.log("Seed concluido.");
  console.log("Cliente demo: cliente@doceencanto.com.br / 123456");
  console.log("Admin demo: admin@doceencanto.com.br / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });