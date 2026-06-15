import type { PrismaClient } from "@prisma/client";
import type { ContentBlockType, Prisma } from "@prisma/client";

import { trackKey, type SeedContext } from "../utils";

type BlockSeed = {
  type: ContentBlockType;
  order: number;
  data: Prisma.InputJsonValue;
};

type LessonSeed = {
  slug: string;
  title: string;
  summary: string;
  order: number;
  estimatedMin: number;
  conceptSlugs: string[];
  blocks: BlockSeed[];
};

const LESSONS: LessonSeed[] = [
  {
    slug: "what-is-silicon",
    title: "What is Silicon?",
    summary:
      "Why element 14 became the foundation of the digital world — from sand to single-crystal wafers.",
    order: 0,
    estimatedMin: 8,
    conceptSlugs: ["silicon"],
    blocks: [
      {
        type: "HEADING",
        order: 0,
        data: { level: 1, text: "What is Silicon?" },
      },
      {
        type: "TEXT",
        order: 1,
        data: {
          markdown: `Silicon is the second-most abundant element in Earth's crust, yet the semiconductor industry spends enormous effort purifying it to **99.9999999%** purity — "nine nines" — before a single transistor can be built.

Unlike metals, pure silicon sits in a sweet spot on the periodic table: four valence electrons let it form a stable **diamond cubic crystal lattice**, and its band gap (~1.1 eV at room temperature) means we can switch between insulating and conducting states with modest voltage swings.`,
        },
      },
      {
        type: "CALLOUT",
        order: 2,
        data: {
          variant: "info",
          markdown:
            "**Did you know?** A 300 mm wafer weighing just a few hundred grams can host tens of billions of transistors once patterned — yet it began as quartzite sand refined through trichlorosilane distillation.",
        },
      },
      {
        type: "HEADING",
        order: 3,
        data: { level: 2, text: "From ingot to wafer" },
      },
      {
        type: "TEXT",
        order: 4,
        data: {
          markdown: `The journey starts with the **Czochralski (CZ) process**: a seed crystal is dipped into molten polysilicon and slowly pulled while rotating, growing a single-crystal ingot up to 2 meters long. The ingot is diamond-cut into cylinders, ground to precise diameter, then sliced into wafers just **775 μm** thick.

Wafers are polished to mirror smoothness because lithography at nanometer scales cannot tolerate surface roughness. Each wafer becomes a shared substrate for hundreds or thousands of identical chips (the **die**), later separated during packaging.`,
        },
      },
      {
        type: "DIAGRAM",
        order: 5,
        data: {
          src: "/assets/diagrams/silicon-wafer.svg",
          alt: "Cross-section diagram showing a silicon ingot being sliced into circular wafers",
          caption: "Single-crystal ingots are sliced into polished wafers — the blank canvas of chip fabrication.",
        },
      },
      {
        type: "HEADING",
        order: 6,
        data: { level: 2, text: "Why silicon, not germanium?" },
      },
      {
        type: "TEXT",
        order: 7,
        data: {
          markdown: `Germanium was used in the first transistors, but silicon won for three reasons:

1. **Abundance** — cheaper raw material at planetary scale.
2. **Stable oxide** — silicon dioxide (SiO₂) forms a high-quality insulator natively, enabling the MOS gate structure that defines modern ICs.
3. **Thermal robustness** — silicon devices survive higher operating temperatures in packaged systems.

Doping — adding trace amounts of phosphorus (n-type, extra electrons) or boron (p-type, electron holes) — creates the p-n junctions that make diodes and transistors possible.`,
        },
      },
      {
        type: "CALLOUT",
        order: 8,
        data: {
          variant: "tip",
          markdown:
            "When you read about a **process node** (3nm, 5nm), remember: the number no longer equals a specific physical feature size. It is a marketing generation label for a bundle of density, power, and performance improvements on silicon.",
        },
      },
    ],
  },
  {
    slug: "how-transistors-work",
    title: "How Transistors Work",
    summary:
      "The switch that makes binary logic possible — gate voltage, channels, and the MOSFET at the heart of every chip.",
    order: 1,
    estimatedMin: 10,
    conceptSlugs: ["silicon", "transistor", "mosfet"],
    blocks: [
      {
        type: "HEADING",
        order: 0,
        data: { level: 1, text: "How Transistors Work" },
      },
      {
        type: "TEXT",
        order: 1,
        data: {
          markdown: `A **transistor** is a three-terminal device that amplifies or switches electrical signals. In digital chips we use it almost exclusively as a switch: **on** (conducting, logic 1) or **off** (non-conducting, logic 0).

The dominant variant is the **MOSFET** — Metal-Oxide-Semiconductor Field-Effect Transistor. Three terminals:

- **Gate** — controls whether current flows; separated from the channel by a thin oxide insulator.
- **Source** — where charge carriers enter the channel.
- **Drain** — where carriers exit.

Apply voltage above the **threshold voltage (Vₜ)** and an inversion layer forms beneath the gate oxide — a conductive channel linking source to drain. Remove it, and the channel disappears.`,
        },
      },
      {
        type: "DIAGRAM",
        order: 2,
        data: {
          src: "/assets/diagrams/transistor.svg",
          alt: "Diagram of an NMOS transistor showing gate, source, drain, and channel region",
          caption: "An NMOS transistor in saturation — gate voltage creates a conductive channel between source and drain.",
        },
      },
      {
        type: "CALLOUT",
        order: 3,
        data: {
          variant: "warning",
          markdown:
            "**Leakage matters.** As transistors shrink, quantum tunneling through thin gate oxides causes **subthreshold leakage** — current even when the device should be off. Power density, not just switching speed, now limits scaling.",
        },
      },
      {
        type: "HEADING",
        order: 4,
        data: { level: 2, text: "CMOS: complementary pairs" },
      },
      {
        type: "TEXT",
        order: 5,
        data: {
          markdown: `Practical logic uses **CMOS** (Complementary MOS): an NMOS and PMOS transistor paired so that one is always off during steady state. This gives us:

- **Near-zero static power** when inputs are stable (no direct path from VDD to ground).
- **Sharp voltage transitions** — output rails between supply (logic 1) and ground (logic 0).

A modern CPU contains **10–100 billion** transistors, but each one is still, at root, this same switch — replicated, interconnected, and clocked billions of times per second.`,
        },
      },
      {
        type: "HEADING",
        order: 6,
        data: { level: 2, text: "Scaling the switch" },
      },
      {
        type: "TEXT",
        order: 7,
        data: {
          markdown: `Planar MOSFETs gave way to **FinFET** (3D fin-shaped channel) at ~22nm, improving gate control and reducing leakage. The industry is transitioning to **Gate-All-Around (GAA)** nanosheet transistors at 2nm and below.

Each geometry change is a response to the same physics problem: when the channel length approaches a few nanometers, the gate cannot fully shut off the channel without wrapping around it.`,
        },
      },
      {
        type: "CALLOUT",
        order: 8,
        data: {
          variant: "info",
          markdown:
            "The [[transistor]] is the atomic unit of computation. Understanding it unlocks everything from [[logic-gate]] to the [[cpu-pipeline]].",
        },
      },
    ],
  },
  {
    slug: "logic-gates-and-boolean-logic",
    title: "Logic Gates & Boolean Algebra",
    summary:
      "AND, OR, NOT — how transistors compose into the arithmetic and control circuits inside every processor.",
    order: 2,
    estimatedMin: 9,
    conceptSlugs: ["logic-gate", "transistor"],
    blocks: [
      {
        type: "HEADING",
        order: 0,
        data: { level: 1, text: "Logic Gates & Boolean Algebra" },
      },
      {
        type: "TEXT",
        order: 1,
        data: {
          markdown: `**Boolean algebra** reduces logic to two values: true (1) and false (0). A **logic gate** is a physical circuit implementing a Boolean function.

| Gate | Function | Truth (A, B → Out) |
|------|----------|---------------------|
| AND  | A ∧ B    | 1 only if both inputs are 1 |
| OR   | A ∨ B    | 1 if either input is 1 |
| NOT  | ¬A       | Inverts the input |
| NAND | ¬(A ∧ B) | Universal — any function can be built from NAND alone |

CMOS schematics combine PMOS pull-up networks and NMOS pull-down networks to implement each gate with no static current.`,
        },
      },
      {
        type: "DIAGRAM",
        order: 2,
        data: {
          src: "/assets/diagrams/logic-gate.svg",
          alt: "Schematic showing CMOS NAND gate with PMOS and NMOS transistor pairs",
          caption: "A CMOS NAND gate — two PMOS transistors in parallel (pull-up) and two NMOS in series (pull-down).",
        },
      },
      {
        type: "HEADING",
        order: 3,
        data: { level: 2, text: "From gates to arithmetic" },
      },
      {
        type: "TEXT",
        order: 4,
        data: {
          markdown: `Gates compose into **half adders** (sum + carry), then **full adders**, then multi-bit **adders** that execute integer addition in a single clock cycle inside an ALU.

The same composition builds multiplexers (select one of N inputs), decoders (activate one of N outputs), and flip-flops (store one bit of state). A CPU is, at bottom, an astronomically large graph of gates clocked in careful synchrony.`,
        },
      },
      {
        type: "CALLOUT",
        order: 5,
        data: {
          variant: "tip",
          markdown:
            "**Propagation delay** — each gate takes picoseconds to settle. Critical path length (the longest chain of dependent gates in one cycle) sets the **maximum clock frequency**.",
        },
      },
      {
        type: "HEADING",
        order: 6,
        data: { level: 2, text: "Why this matters for CPUs" },
      },
      {
        type: "TEXT",
        order: 7,
        data: {
          markdown: `When you write \`a + b\` in C, the compiler maps it to machine instructions. The hardware executes those instructions by routing operands through combinational logic (gates) and storing results in registers (flip-flops).

The **instruction pipeline** you will study next is the organizational layer above these gates — overlapping fetch, decode, and execute so the sea of transistors never sits idle.`,
        },
      },
      {
        type: "CALLOUT",
        order: 8,
        data: {
          variant: "info",
          markdown:
            "Moore's Law ([[moores-law]]) predicted that gate counts would explode. Architecture — pipelines, caches, branch prediction — is how engineers turn more transistors into more **useful** performance.",
        },
      },
    ],
  },
];

export async function seedFundamentalsLessons(
  prisma: PrismaClient,
  ctx: Pick<SeedContext, "tracks" | "concepts">,
): Promise<void> {
  const trackId = ctx.tracks[trackKey("fundamentals", "foundations")];
  if (!trackId) {
    throw new Error('Track "fundamentals:foundations" not found — seed modules first.');
  }

  for (const lesson of LESSONS) {
    const lessonRecord = await prisma.lesson.upsert({
      where: { trackId_slug: { trackId, slug: lesson.slug } },
      create: {
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        order: lesson.order,
        estimatedMin: lesson.estimatedMin,
        published: true,
        trackId,
        concepts: {
          connect: lesson.conceptSlugs.map((slug) => {
            const id = ctx.concepts[slug];
            if (!id) throw new Error(`Concept "${slug}" not found for lesson "${lesson.slug}"`);
            return { id };
          }),
        },
      },
      update: {
        title: lesson.title,
        summary: lesson.summary,
        order: lesson.order,
        estimatedMin: lesson.estimatedMin,
        published: true,
        concepts: {
          set: lesson.conceptSlugs.map((slug) => {
            const id = ctx.concepts[slug];
            if (!id) throw new Error(`Concept "${slug}" not found for lesson "${lesson.slug}"`);
            return { id };
          }),
        },
      },
    });

    await prisma.contentBlock.deleteMany({ where: { lessonId: lessonRecord.id } });

    for (const block of lesson.blocks) {
      await prisma.contentBlock.create({
        data: {
          type: block.type,
          order: block.order,
          data: block.data,
          lessonId: lessonRecord.id,
        },
      });
    }
  }
}
