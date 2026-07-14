import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_TICKETS = [
  {
    id: "T-2050",
    title: "Production API returning 500s",
    body: "Checkout API is throwing 500 errors. Customers cannot access anything.",
    priority: "P0" as const,
    owner: "engineering",
    channel: "web",
  },
  {
    id: "T-2049",
    title: "Charged twice for my subscription",
    body: "I was charged twice this month. I need a refund on the duplicate payment.",
    priority: "P1" as const,
    owner: "billing",
    channel: "email",
  },
  {
    id: "T-2048",
    title: "Cannot log in after password reset",
    body: "I did a password reset but still cannot log in and I am locked out.",
    priority: "P1" as const,
    owner: "engineering",
    channel: "chat",
  },
  {
    id: "T-2047",
    title: "App crashes on save",
    body: "The app crashes with a stack trace every time I click save.",
    priority: "P1" as const,
    owner: null,
    channel: "web",
  },
  {
    id: "T-2046",
    title: "How do I export my data?",
    body: "Where do I find the export option? Is there a guide?",
    priority: "P2" as const,
    owner: "success",
    channel: "web",
  },
  {
    id: "T-2045",
    title: "Dark mode request",
    body: "Would be nice if you could add a dark mode.",
    priority: "P2" as const,
    owner: null,
    channel: "web",
  },
  {
    id: "T-2044",
    title: "Quick question",
    body: "Hi, I had a general question about something from yesterday.",
    priority: "P2" as const,
    owner: null,
    channel: "chat",
  },
] as const;

async function main() {
  console.log("Seeding database...");
  for (const t of SEED_TICKETS) {
    await prisma.ticket.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }
  console.log(`Seeded ${SEED_TICKETS.length} tickets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
