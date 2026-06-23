import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedTicketSchema } from "../src/lib/validation";

const prisma = new PrismaClient();

const here = dirname(fileURLToPath(import.meta.url));
const seedPath = join(here, "seed-data", "tickets.json");

async function main(): Promise<void> {
  const raw: unknown = JSON.parse(readFileSync(seedPath, "utf8"));
  const tickets = seedTicketSchema.array().parse(raw);

  // Idempotent reseed: clear then insert so re-runs are deterministic.
  await prisma.ticket.deleteMany();
  for (const t of tickets) {
    await prisma.ticket.create({ data: t });
  }

  console.log(`Seeded ${tickets.length} tickets from ${seedPath}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
