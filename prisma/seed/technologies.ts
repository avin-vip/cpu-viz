import type { PrismaClient, Prisma } from "@prisma/client";
import type { TechCategory } from "@prisma/client";

type TechnologySeed = {
  slug: string;
  name: string;
  category: TechCategory;
  description: string;
  nodeNm?: number;
  metadata?: Prisma.InputJsonValue;
};

const TECHNOLOGIES: TechnologySeed[] = [
  {
    slug: "euv-lithography",
    name: "EUV Lithography",
    category: "PROCESS",
    description:
      "Extreme ultraviolet lithography at 13.5nm wavelength, enabling patterning of features below 7nm. ASML is the sole commercial supplier of EUV scanners.",
    nodeNm: 5,
    metadata: { wavelengthNm: 13.5, supplier: "ASML" },
  },
  {
    slug: "duv-lithography",
    name: "DUV Lithography",
    category: "PROCESS",
    description:
      "Deep ultraviolet lithography (193nm ArF) used for mature and mid-range process nodes. Multi-patterning extends DUV to 7nm-class features.",
    nodeNm: 7,
    metadata: { wavelengthNm: 193 },
  },
  {
    slug: "finfet",
    name: "FinFET Transistor",
    category: "ARCHITECTURE",
    description:
      "Three-dimensional transistor structure with a fin-shaped channel, introduced at 22nm and dominant through 3nm nodes for improved electrostatic control.",
    nodeNm: 3,
  },
  {
    slug: "gaa-transistor",
    name: "Gate-All-Around (GAA)",
    category: "ARCHITECTURE",
    description:
      "Next-generation transistor architecture (nanosheet/nanowire) where the gate wraps the channel on all sides. Samsung and Intel deploy GAA at 3nm and below.",
    nodeNm: 2,
  },
  {
    slug: "hbm",
    name: "High Bandwidth Memory (HBM)",
    category: "PACKAGING",
    description:
      "3D-stacked DRAM with through-silicon vias (TSVs) delivering terabytes-per-second bandwidth. Essential for AI accelerators and HPC GPUs.",
    metadata: { generations: ["HBM2", "HBM2e", "HBM3", "HBM3e"] },
  },
  {
    slug: "cowos",
    name: "CoWoS Packaging",
    category: "PACKAGING",
    description:
      "Chip on Wafer on Substrate — TSMC's 2.5D interposer packaging technology that integrates logic die with HBM stacks on a silicon interposer.",
    metadata: { foundry: "TSMC" },
  },
  {
    slug: "chiplet-packaging",
    name: "Chiplet Packaging",
    category: "PACKAGING",
    description:
      "Modular die integration using advanced packaging (CoWoS, InFO, EMIB) to combine compute, I/O, and memory chiplets in a single package.",
  },
  {
    slug: "cmp",
    name: "Chemical Mechanical Polishing",
    category: "PROCESS",
    description:
      "Fab process step that planarizes wafer surfaces using chemical slurry and mechanical abrasion. Critical after each deposition/etch layer.",
  },
  {
    slug: "ald",
    name: "Atomic Layer Deposition",
    category: "TOOL",
    description:
      "Thin-film deposition technique enabling angstrom-level thickness control for high-k gate dielectrics and spacer materials at advanced nodes.",
  },
  {
    slug: "3nm-process",
    name: "3nm Process Node",
    category: "PROCESS",
    description:
      "Leading-edge semiconductor manufacturing node offering ~25–30% power reduction or ~10–15% performance gain versus 5nm, depending on foundry implementation.",
    nodeNm: 3,
    metadata: { foundries: ["TSMC N3", "Samsung 3GAE", "Intel 3"] },
  },
];

export const TECHNOLOGY_COUNT = TECHNOLOGIES.length;

export async function seedTechnologies(
  prisma: PrismaClient,
): Promise<Record<string, string>> {
  const technologies: Record<string, string> = {};

  for (const tech of TECHNOLOGIES) {
    const record = await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: {
        name: tech.name,
        category: tech.category,
        description: tech.description,
        nodeNm: tech.nodeNm ?? null,
        metadata: tech.metadata ?? undefined,
      },
      create: {
        slug: tech.slug,
        name: tech.name,
        category: tech.category,
        description: tech.description,
        nodeNm: tech.nodeNm ?? null,
        metadata: tech.metadata ?? undefined,
      },
    });

    technologies[tech.slug] = record.id;
  }

  return technologies;
}
