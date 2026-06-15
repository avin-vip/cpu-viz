import { PrismaClient } from "@prisma/client";

import { seedConcepts } from "./concepts";
import { seedCompanies } from "./companies";
import { GRAPH_EDGE_COUNT, seedGraphEdges } from "./graph-edges";
import { seedFundamentalsLessons } from "./lessons/fundamentals";
import { seedCpuLessons } from "./lessons/cpu";
import { seedModules } from "./modules";
import { PRODUCT_COUNT, seedProducts } from "./products";
import { TECHNOLOGY_COUNT, seedTechnologies } from "./technologies";
import { buildSeedContext } from "./utils";
import { seedVisualizations } from "./visualizations";

const prisma = new PrismaClient();

async function clearDatabase(): Promise<void> {
  console.log("Clearing existing seed data…");

  // Order respects foreign keys and many-to-many join tables.
  await prisma.contentBlock.deleteMany();
  await prisma.conceptPrerequisite.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.track.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.graphEdge.deleteMany();
  await prisma.product.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.process.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.visualization.deleteMany();
  await prisma.company.deleteMany();
  await prisma.module.deleteMany();
}

async function main(): Promise<void> {
  console.log("🌱 CPU Viz — seeding database…\n");

  await clearDatabase();

  console.log("→ Modules & tracks");
  const moduleCtx = await seedModules(prisma);

  console.log("→ Concepts & prerequisites");
  const concepts = await seedConcepts(prisma, moduleCtx);

  console.log("→ Visualizations");
  await seedVisualizations(prisma);

  const ctx = await buildSeedContext(prisma);

  console.log("→ Fundamentals lessons");
  await seedFundamentalsLessons(prisma, { tracks: ctx.tracks, concepts: ctx.concepts });

  console.log("→ CPU lessons");
  await seedCpuLessons(prisma, { tracks: ctx.tracks, concepts: ctx.concepts });

  console.log("→ Companies & facilities");
  const companies = await seedCompanies(prisma);

  console.log("→ Technologies");
  await seedTechnologies(prisma);

  console.log("→ Products");
  await seedProducts(prisma, companies);

  console.log("→ Supply chain graph edges");
  await seedGraphEdges(prisma, companies);

  const [moduleCount, trackCount, lessonCount, blockCount, conceptCount, companyCount, facilityCount, technologyCount, productCount, edgeCount, vizCount] =
    await Promise.all([
      prisma.module.count(),
      prisma.track.count(),
      prisma.lesson.count(),
      prisma.contentBlock.count(),
      prisma.concept.count(),
      prisma.company.count(),
      prisma.facility.count(),
      prisma.technology.count(),
      prisma.product.count(),
      prisma.graphEdge.count(),
      prisma.visualization.count(),
    ]);

  const publishedModules = await prisma.module.count({ where: { published: true } });

  console.log("\n✅ Seed complete:");
  console.log(`   ${moduleCount} modules (${publishedModules} published)`);
  console.log(`   ${trackCount} tracks`);
  console.log(`   ${lessonCount} lessons, ${blockCount} content blocks`);
  console.log(`   ${conceptCount} concepts`);
  console.log(`   ${companyCount} companies, ${facilityCount} facilities`);
  console.log(`   ${technologyCount} technologies (expected ≥8, defined ${TECHNOLOGY_COUNT})`);
  console.log(`   ${productCount} products (expected ≥6, defined ${PRODUCT_COUNT})`);
  console.log(`   ${edgeCount} graph edges (expected ≥45, defined ${GRAPH_EDGE_COUNT})`);
  console.log(`   ${vizCount} visualizations`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { clearDatabase, main as seed };
