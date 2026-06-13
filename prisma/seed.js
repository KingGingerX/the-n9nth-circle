const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const FORUM_CATEGORIES = [
  { name: "Painting & Hobby", slug: "painting-hobby", icon: "🎨", isPremiumOnly: false, description: "Techniques, WIP, tips, tutorials", sortOrder: 1 },
  { name: "Tactics & List Building", slug: "tactics-lists", icon: "⚔️", isPremiumOnly: false, description: "Army lists, meta discussion, strategy", sortOrder: 2 },
  { name: "Buy/Sell Feedback", slug: "feedback", icon: "⭐", isPremiumOnly: false, description: "Rate your transactions, seller/buyer reviews", sortOrder: 3 },
  { name: "Exclusive Sales Lounge", slug: "exclusive-sales", icon: "💀", isPremiumOnly: true, description: "First access to rare listings — premium members only", sortOrder: 4 },
  { name: "Off-Topic Degeneracy", slug: "off-topic", icon: "🍺", isPremiumOnly: false, description: "Everything else. Keep it civil-ish.", sortOrder: 5 },
];

async function main() {
  console.log("Seeding forum categories...");

  for (const cat of FORUM_CATEGORIES) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log(`✓ ${FORUM_CATEGORIES.length} forum categories seeded`);
  console.log("\nSet ADMIN_EMAIL in your .env to get Game Master access on first login.");
  console.log("Done. The arena is ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
