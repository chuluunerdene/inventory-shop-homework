import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Электроник",
      slug: "electronics",
    },
  });

  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: {},
    create: {
      name: "Хувцас",
      slug: "apparel",
    },
  });

  const seedProducts = [
    {
      name: "Утасгүй чихэвч",
      description: "Ажил болон өдөр тутмын хэрэглээнд тохирсон дуу чимээ тусгаарлагч чихэвч.",
      priceInCents: 289900,
      imageUrl:
        "https://images.unsplash.com/photo-1592041275490-dcac548bad2e?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdpcmVsZXNzJTIwaGVhZHBob25lfGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=60&w=3000",
      lowStockThreshold: 4,
      categoryId: electronics.id,
      quantity: 12,
    },
    {
      name: "Механик гар",
      description: "Тактиль товчлууртай, товчлуур нь сольж болдог авсаархан гар.",
      priceInCents: 219900,
      imageUrl:
        "https://images.unsplash.com/photo-1626958390898-162d3577f293?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVjaGFuaWNhbCUyMGtleWJvYXJkfGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=60&w=3000",
      lowStockThreshold: 3,
      categoryId: electronics.id,
      quantity: 2,
    },
    {
      name: "4K дэлгэц",
      description: "Өнгөний ялгаралт сайтай, USB-C оролттой 27 инчийн дэлгэц.",
      priceInCents: 899900,
      imageUrl:
        "https://images.unsplash.com/photo-1745910020846-3d4d0088d24d?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
      lowStockThreshold: 2,
      categoryId: electronics.id,
      quantity: 0,
    },
    {
      name: "Минимал малгайтай цамц",
      description: "Чөлөөт эсгүүртэй, зузаан даавуун материалтай малгайтай цамц.",
      priceInCents: 159900,
      imageUrl:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9vZGllfGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=60&w=3000",
      lowStockThreshold: 5,
      categoryId: apparel.id,
      quantity: 18,
    },
    {
      name: "Шулуун эсгүүртэй жинс",
      description: "Өдөр тутам өмсөхөд тохиромжтой, уян хатан хольцтой жинс.",
      priceInCents: 184900,
      imageUrl:
        "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amVhbnN8ZW58MHx8MHx8fDA%3D&ixlib=rb-4.1.0&q=60&w=3000",
      lowStockThreshold: 4,
      categoryId: apparel.id,
      quantity: 4,
    },
    {
      name: "Хөнгөн хүрэм",
      description: "Сэрүүн улиралд өмсөхөд тохиромжтой хөнгөн гадуур хүрэм.",
      priceInCents: 249900,
      imageUrl:
        "https://images.unsplash.com/photo-1548883354-caf6b10b1e1b?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8amFja2V0JTIwbWVufGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=60&w=3000",
      lowStockThreshold: 3,
      categoryId: apparel.id,
      quantity: 9,
    },
  ];

  for (const item of seedProducts) {
    const product = await prisma.product.upsert({
      where: {
        id: `${item.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {
        name: item.name,
        description: item.description,
        priceInCents: item.priceInCents,
        imageUrl: item.imageUrl,
        lowStockThreshold: item.lowStockThreshold,
        categoryId: item.categoryId,
      },
      create: {
        id: `${item.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: item.name,
        description: item.description,
        priceInCents: item.priceInCents,
        imageUrl: item.imageUrl,
        lowStockThreshold: item.lowStockThreshold,
        categoryId: item.categoryId,
      },
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {
        quantity: item.quantity,
      },
      create: {
        productId: product.id,
        quantity: item.quantity,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
