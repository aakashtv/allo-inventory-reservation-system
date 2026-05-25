import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.inventory.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Create Warehouses
  const w1 = await prisma.warehouse.create({
    data: { name: "Central Hub", location: "New York, NY" },
  });
  const w2 = await prisma.warehouse.create({
    data: { name: "West Coast Distribution", location: "Los Angeles, CA" },
  });
  const w3 = await prisma.warehouse.create({
    data: { name: "EU Fulfillment", location: "Berlin, DE" },
  });

  const warehouses = [w1, w2, w3];

  // Create Products
  const productsData = [
    {
      name: "Premium Laptop Pro",
      sku: "LAP-PRO-001",
      description: "High performance laptop",
      price: 1999.99,
    },
    {
      name: "Wireless Noise-Canceling Headphones",
      sku: "AUD-WNC-002",
      description: "Industry leading NC",
      price: 349.5,
    },
    {
      name: "Mechanical Keyboard",
      sku: "KEY-MCH-003",
      description: "Tactile switches, RGB",
      price: 149.0,
    },
    {
      name: "4K Ultrawide Monitor",
      sku: "MON-4KU-004",
      description: "34 inch ultrawide display",
      price: 799.0,
    },
    {
      name: "Ergonomic Office Chair",
      sku: "CHR-ERG-005",
      description: "Lumbar support, adjustable",
      price: 499.0,
    },
  ];

  const products = [];
  for (const p of productsData) {
    products.push(await prisma.product.create({ data: p }));
  }

  // Create Inventory Distribution
  for (const product of products) {
    for (const warehouse of warehouses) {
      // Random quantity between 10 and 100
      const totalUnits = Math.floor(Math.random() * 91) + 10;
      await prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          totalUnits,
          reservedUnits: 0,
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
