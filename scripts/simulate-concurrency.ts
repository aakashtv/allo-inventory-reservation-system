import { PrismaClient } from "@prisma/client";
import { ReservationService } from "../src/server/services/ReservationService";

const prisma = new PrismaClient();
const reservationService = new ReservationService();

async function simulate() {
  console.log("Starting Concurrency Simulation...");

  // 1. Setup a dummy product and warehouse
  const product = await prisma.product.create({
    data: {
      name: "Concurrency Test Product",
      sku: `TEST-SKU-${Date.now()}`,
      price: 100,
    },
  });

  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Test Warehouse",
      location: "Test Location",
    },
  });

  // 2. Add EXACTLY 1 unit of inventory
  const inventory = await prisma.inventory.create({
    data: {
      productId: product.id,
      warehouseId: warehouse.id,
      totalUnits: 1,
      reservedUnits: 0,
    },
  });

  console.log(`Created 1 unit of inventory for Product: ${product.id}`);

  // 3. Fire 10 simultaneous reservation requests
  console.log("Firing 10 simultaneous reservation requests...");

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      reservationService
        .createReservation(product.id, warehouse.id, 1)
        .then((res) => ({ success: true, id: res.id }))
        .catch((err) => ({ success: false, error: err.message }))
    );
  }

  const results = await Promise.allSettled(promises);

  const successes = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  );
  const failures = results.filter(
    (r) => r.status === "fulfilled" && !r.value.success
  );

  console.log("\n--- SIMULATION RESULTS ---");
  console.log(`Successful Reservations: ${successes.length} (Expected: 1)`);
  console.log(
    `Failed Reservations (409 Conflict): ${failures.length} (Expected: 9)`
  );

  if (successes.length === 1 && failures.length === 9) {
    console.log("✅ CONCURRENCY TEST PASSED: Exactly 1 success, 9 conflicts.");
  } else {
    console.error("❌ CONCURRENCY TEST FAILED!");
  }

  // 4. Verify Database state
  const finalInventory = await prisma.inventory.findUnique({
    where: { id: inventory.id },
  });

  console.log("\n--- FINAL INVENTORY STATE ---");
  console.log(`Total Units: ${finalInventory?.totalUnits}`);
  console.log(`Reserved Units: ${finalInventory?.reservedUnits}`);
  console.log(
    `Available Units: ${finalInventory!.totalUnits - finalInventory!.reservedUnits}`
  );

  if (finalInventory?.reservedUnits === 1) {
    console.log(
      "✅ INVENTORY INTEGRITY PASSED: Reserved units accurately reflect 1 unit."
    );
  } else {
    console.error("❌ INVENTORY INTEGRITY FAILED: Overselling detected!");
  }

  console.log("\nCleaning up test data...");
  await prisma.inventory.delete({ where: { id: inventory.id } });
  if (successes[0]?.status === "fulfilled" && successes[0].value.success) {
    const resId = (successes[0].value as { id?: string }).id as string;
    await prisma.reservation.delete({ where: { id: resId } });
  }
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.warehouse.delete({ where: { id: warehouse.id } });
}

simulate()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
