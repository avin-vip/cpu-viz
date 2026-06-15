import type { PrismaClient } from "@prisma/client";

import { validatePrerequisiteDAG, type SeedContext } from "./utils";

type ConceptSeed = {
  slug: string;
  term: string;
  definition: string;
  moduleSlug: string;
};

const CONCEPTS: ConceptSeed[] = [
  {
    slug: "silicon",
    term: "Silicon",
    definition:
      "A semiconductor element (atomic number 14) that forms a diamond cubic crystal structure. Pure silicon is an insulator at room temperature; doping and field effects create the conductive channels used in virtually all integrated circuits. Wafers are sliced from single-crystal ingots grown via the Czochralski process.",
    moduleSlug: "fundamentals",
  },
  {
    slug: "transistor",
    term: "Transistor",
    definition:
      "A three-terminal semiconductor device that amplifies or switches electronic signals. In digital ICs, transistors act as voltage-controlled switches: when the gate voltage exceeds a threshold, a conductive channel forms between source and drain, representing a binary 1; otherwise the channel is off (0).",
    moduleSlug: "fundamentals",
  },
  {
    slug: "logic-gate",
    term: "Logic Gate",
    definition:
      "A combinational circuit built from transistors that implements a Boolean function — AND, OR, NOT, NAND, NOR, XOR. Gates are composed into adders, multiplexers, and eventually full processors. CMOS logic uses complementary NMOS/PMOS pairs for low static power.",
    moduleSlug: "fundamentals",
  },
  {
    slug: "moores-law",
    term: "Moore's Law",
    definition:
      "The observation (1965, Gordon Moore) that the number of transistors on a leading-edge chip doubles roughly every two years. It is an economic and engineering trend — enabled by lithography advances, yield learning, and Dennard scaling — rather than a physical law. Slowing transistor scaling has shifted industry focus toward architecture, packaging, and specialization.",
    moduleSlug: "fundamentals",
  },
  {
    slug: "mosfet",
    term: "MOSFET",
    definition:
      "Metal-Oxide-Semiconductor Field-Effect Transistor — the dominant transistor type in modern ICs. A gate electrode separated from the channel by a thin oxide insulator controls current flow without steady gate current. FinFET and GAA (gate-all-around) variants extend scaling by improving electrostatic control at nanometer dimensions.",
    moduleSlug: "fundamentals",
  },
  {
    slug: "cpu-pipeline",
    term: "CPU Pipeline",
    definition:
      "An instruction-processing pipeline that overlaps fetch, decode, execute, memory access, and writeback stages so multiple instructions are in flight simultaneously. Pipelining raises throughput (instructions per cycle) but introduces hazards — data dependencies, control dependencies, and structural conflicts — that microarchitects resolve via forwarding, stalls, and speculation.",
    moduleSlug: "cpu",
  },
  {
    slug: "branch-prediction",
    term: "Branch Prediction",
    definition:
      "Hardware that guesses the outcome of conditional branches before the condition is evaluated, allowing the pipeline to fetch down the predicted path. Modern CPUs use multi-level predictors (bimodal, gshare, perceptron hybrids) and branch target buffers. Mispredictions flush speculative work, costing 10–20 cycles on deep pipelines.",
    moduleSlug: "cpu",
  },
];

/** source → target: source must be understood before target */
const PREREQUISITES: Array<{ source: string; target: string }> = [
  { source: "silicon", target: "transistor" },
  { source: "transistor", target: "logic-gate" },
  { source: "transistor", target: "moores-law" },
  { source: "transistor", target: "mosfet" },
  { source: "logic-gate", target: "cpu-pipeline" },
  { source: "mosfet", target: "cpu-pipeline" },
  { source: "cpu-pipeline", target: "branch-prediction" },
];

export async function seedConcepts(
  prisma: PrismaClient,
  ctx: Pick<SeedContext, "modules">,
): Promise<Record<string, string>> {
  validatePrerequisiteDAG(PREREQUISITES);

  const concepts: Record<string, string> = {};

  for (const concept of CONCEPTS) {
    const moduleId = ctx.modules[concept.moduleSlug];
    if (!moduleId) {
      throw new Error(`Module "${concept.moduleSlug}" not found — seed modules first.`);
    }

    const record = await prisma.concept.upsert({
      where: { slug: concept.slug },
      create: {
        slug: concept.slug,
        term: concept.term,
        definition: concept.definition,
        moduleId,
      },
      update: {
        term: concept.term,
        definition: concept.definition,
        moduleId,
      },
    });

    concepts[concept.slug] = record.id;
  }

  for (const { source, target } of PREREQUISITES) {
    const sourceId = concepts[source];
    const targetId = concepts[target];

    if (!sourceId || !targetId) {
      throw new Error(`Missing concept for prerequisite edge ${source} → ${target}`);
    }

    await prisma.conceptPrerequisite.upsert({
      where: {
        sourceId_targetId: { sourceId, targetId },
      },
      create: { sourceId, targetId },
      update: {},
    });
  }

  return concepts;
}
