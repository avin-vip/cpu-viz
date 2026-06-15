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
    slug: "introduction-to-cpu-architecture",
    title: "Introduction to CPU Architecture",
    summary:
      "Registers, the program counter, and the fetch-decode-execute cycle that drives every general-purpose processor.",
    order: 0,
    estimatedMin: 10,
    conceptSlugs: ["cpu-pipeline", "logic-gate"],
    blocks: [
      {
        type: "HEADING",
        order: 0,
        data: { level: 1, text: "Introduction to CPU Architecture" },
      },
      {
        type: "TEXT",
        order: 1,
        data: {
          markdown: `A **CPU** (Central Processing Unit) executes a program by repeatedly fetching instructions from memory, decoding them, and performing the specified operation. At any instant, the processor's visible state is captured by:

- **Program Counter (PC)** — address of the next instruction to fetch.
- **Register file** — small, fast storage holding operands and temporary results.
- **Status flags** — zero, carry, overflow bits set by arithmetic operations.

The **Instruction Set Architecture (ISA)** — x86, ARM, RISC-V — defines the contract between software and hardware. Microarchitecture (pipelines, caches, predictors) is the implementation hidden behind that contract.`,
        },
      },
      {
        type: "CALLOUT",
        order: 2,
        data: {
          variant: "info",
          markdown:
            "**CISC vs RISC** — x86 uses variable-length instructions and complex addressing modes (CISC heritage). ARM and RISC-V favor fixed-width instructions and load/store architecture (RISC). Modern x86 CPUs internally translate to RISC-like **micro-operations (μops)**.",
        },
      },
      {
        type: "HEADING",
        order: 3,
        data: { level: 2, text: "The basic execution cycle" },
      },
      {
        type: "TEXT",
        order: 4,
        data: {
          markdown: `Even the simplest processor loops through:

1. **Fetch** — read instruction bytes from memory at PC.
2. **Decode** — determine opcode and operand locations.
3. **Execute** — run ALU operation or compute effective address.
4. **Memory** — load or store data if required.
5. **Writeback** — commit result to register file; advance PC.

A **single-cycle** design completes all five steps in one clock tick. Real CPUs **pipeline** these stages so that while one instruction executes, the next is already being decoded — dramatically increasing throughput.`,
        },
      },
      {
        type: "HEADING",
        order: 5,
        data: { level: 2, text: "Performance is not just clock speed" },
      },
      {
        type: "TEXT",
        order: 6,
        data: {
          markdown: `**IPC** (instructions per cycle) matters as much as GHz. A 3 GHz core achieving 4 IPC retires 12 billion instructions per second. Pipelining, superscalar issue (multiple instructions per cycle), and out-of-order execution all raise IPC — at the cost of complexity and power.

Caches hide memory latency: L1 hits in ~4 cycles, L2 in ~12, DRAM in **200+**. Most microarchitecture effort goes toward keeping the pipeline fed despite this latency wall.`,
        },
      },
      {
        type: "CALLOUT",
        order: 7,
        data: {
          variant: "tip",
          markdown:
            "Every CPU optimization — wider issue, deeper pipeline, larger caches — trades **transistors** (see [[moores-law]]) for latency hiding or parallelism.",
        },
      },
    ],
  },
  {
    slug: "the-instruction-pipeline",
    title: "The Instruction Pipeline",
    summary:
      "Stage-by-stage walkthrough of a classic five-stage pipeline with interactive visualization.",
    order: 1,
    estimatedMin: 12,
    conceptSlugs: ["cpu-pipeline", "mosfet"],
    blocks: [
      {
        type: "HEADING",
        order: 0,
        data: { level: 1, text: "The Instruction Pipeline" },
      },
      {
        type: "TEXT",
        order: 1,
        data: {
          markdown: `Pipelining divides instruction processing into **overlapping stages**, like an assembly line. A five-stage RISC pipeline (IF → ID → EX → MEM → WB) can theoretically approach **one instruction retired per cycle** once the pipeline is full.

The diagram below is interactive — step through each stage to see what happens to a load instruction as it moves from fetch to writeback.`,
        },
      },
      {
        type: "VISUALIZATION",
        order: 2,
        data: {
          vizSlug: "cpu-pipeline",
          props: { initialStep: 0, showDescriptions: true },
        },
      },
      {
        type: "HEADING",
        order: 3,
        data: { level: 2, text: "Pipeline hazards" },
      },
      {
        type: "TEXT",
        order: 4,
        data: {
          markdown: `Three hazard types stall or complicate pipelining:

**Structural hazards** — hardware resource conflicts (e.g., single memory port for instruction and data). Solved by separate L1I/L1D caches.

**Data hazards** — an instruction needs a result not yet written back.
- *RAW (read after write)* is the common case: solved by **forwarding** (bypass) paths from EX/MEM to EX.
- Unavoidable stalls when the dependent instruction follows immediately after a load.

**Control hazards** — branches change the PC before the outcome is known. Solved by **branch prediction** (covered in the next lesson).`,
        },
      },
      {
        type: "CALLOUT",
        order: 5,
        data: {
          variant: "warning",
          markdown:
            "A **pipeline flush** after a mispredicted branch discards all speculative work in flight — 10–20 wasted cycles on modern deep pipelines. Predictor accuracy directly impacts real-world performance.",
        },
      },
      {
        type: "HEADING",
        order: 6,
        data: { level: 2, text: "Beyond five stages" },
      },
      {
        type: "TEXT",
        order: 7,
        data: {
          markdown: `Commercial CPUs use **12–20+ pipeline stages** in the integer core, further subdividing fetch (BTB lookup, icache access), execute (multiple ALU pipes), and memory (TLB, L1D, queue).

Out-of-order engines add a **ReOrder Buffer (ROB)** and **Reservation Stations** between decode and execute, allowing later independent instructions to pass stalled ones while preserving architectural correctness at retirement.`,
        },
      },
      {
        type: "CALLOUT",
        order: 8,
        data: {
          variant: "info",
          markdown:
            "Explore the full pipeline interactively at **/cpu/pipeline** — the same [[cpu-pipeline]] visualization in full-page mode with step controls.",
        },
      },
    ],
  },
  {
    slug: "branch-prediction-and-speculation",
    title: "Branch Prediction & Speculation",
    summary:
      "How CPUs guess the future to keep pipelines full — and what happens when they guess wrong.",
    order: 2,
    estimatedMin: 11,
    conceptSlugs: ["branch-prediction", "cpu-pipeline"],
    blocks: [
      {
        type: "HEADING",
        order: 0,
        data: { level: 1, text: "Branch Prediction & Speculation" },
      },
      {
        type: "TEXT",
        order: 1,
        data: {
          markdown: `Conditional branches appear every 5–10 instructions in typical code (\`if\`, loops, function returns). The pipeline cannot wait 10+ cycles for branch resolution without stalling — so hardware **predicts** the outcome and speculatively fetches down the predicted path.

Modern predictors achieve **>95% accuracy** on integer benchmarks, but mispredictions remain visible in profiles: tight loops with unpredictable trip counts and polymorphic virtual calls are common culprits.`,
        },
      },
      {
        type: "HEADING",
        order: 2,
        data: { level: 2, text: "Predictor mechanisms" },
      },
      {
        type: "TEXT",
        order: 3,
        data: {
          markdown: `Layers of prediction cooperate:

1. **Branch Target Buffer (BTB)** — caches branch destination addresses for direct jumps.
2. **Bimodal predictor** — per-branch 2-bit saturating counter (taken / not-taken history).
3. **Gshare / TAGE** — global history XORed with PC for correlated branches.
4. **Return Address Stack (RAS)** — predicts function return targets with near-perfect accuracy.

Intel and AMD publish little detail; academic literature (Championship Branch Prediction) guides our mental model.`,
        },
      },
      {
        type: "CALLOUT",
        order: 4,
        data: {
          variant: "tip",
          markdown:
            "**Spectre (2018)** showed that speculative execution + cache side channels leaks secrets. Mitigations (retpolines, IBRS) trade performance for security — branch prediction is no longer purely a performance feature.",
        },
      },
      {
        type: "HEADING",
        order: 5,
        data: { level: 2, text: "Speculation and recovery" },
      },
      {
        type: "TEXT",
        order: 6,
        data: {
          markdown: `When a branch is predicted taken, the CPU:

1. Fetches and decodes down the predicted path.
2. Executes speculatively — results land in the ROB, not the architectural register file.
3. On resolution, if correct: **commit** speculative results in order.
4. If wrong: **squash** speculative state, restore PC, refetch from the correct target.

This mechanism also enables **speculative memory loads** and **value prediction** in aggressive designs — all rolled back on misspeculation.`,
        },
      },
      {
        type: "CALLOUT",
        order: 7,
        data: {
          variant: "info",
          markdown:
            "[[branch-prediction]] depends on understanding the [[cpu-pipeline]] — predictors exist solely to feed instructions into a deep, hungry pipeline without bubbles.",
        },
      },
      {
        type: "TEXT",
        order: 8,
        data: {
          markdown: `**Key takeaway:** Branch prediction converts control-flow uncertainty into a statistical bet. Compiler hints (\`__builtin_expect\`, profile-guided optimization) and branchless coding patterns help when profiles show hot mispredictions — but the hardware predictor is remarkably good without programmer intervention.`,
        },
      },
    ],
  },
];

export async function seedCpuLessons(
  prisma: PrismaClient,
  ctx: Pick<SeedContext, "tracks" | "concepts">,
): Promise<void> {
  const trackId = ctx.tracks[trackKey("cpu", "pipeline")];
  if (!trackId) {
    throw new Error('Track "cpu:pipeline" not found — seed modules first.');
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
