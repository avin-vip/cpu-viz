import type { PrismaClient } from "@prisma/client";
import type { CompanyCategory, VizRenderer } from "@prisma/client";

export async function seedVisualizations(prisma: PrismaClient): Promise<void> {
  await seedCpuPipelineVisualization(prisma);
  await seedSupplyChainVisualization(prisma);
}

async function seedCpuPipelineVisualization(prisma: PrismaClient): Promise<void> {
  const config = {
    renderer: "REACT_FLOW" as const,
    layout: "manual" as const,
    nodes: [
      {
        id: "fetch",
        type: "pipelineStage",
        position: { x: 0, y: 120 },
        data: {
          label: "Fetch",
          stage: 1,
          shortLabel: "IF",
          description:
            "Read the next instruction from the L1 instruction cache using the program counter (PC). Branch prediction may redirect the PC before the instruction is known.",
          color: "#3b82f6",
        },
      },
      {
        id: "decode",
        type: "pipelineStage",
        position: { x: 220, y: 120 },
        data: {
          label: "Decode",
          stage: 2,
          shortLabel: "ID",
          description:
            "Parse the instruction opcode and operands. Register renaming maps architectural registers to physical registers, breaking false dependencies.",
          color: "#6366f1",
        },
      },
      {
        id: "execute",
        type: "pipelineStage",
        position: { x: 440, y: 120 },
        data: {
          label: "Execute",
          stage: 3,
          shortLabel: "EX",
          description:
            "Perform ALU operations, address generation, or dispatch to specialized units (FPU, vector). Results may be forwarded to younger instructions still in the pipeline.",
          color: "#8b5cf6",
        },
      },
      {
        id: "memory",
        type: "pipelineStage",
        position: { x: 660, y: 120 },
        data: {
          label: "Memory",
          stage: 4,
          shortLabel: "MEM",
          description:
            "Access the data cache or TLB for load/store instructions. Cache hits complete in a few cycles; misses stall the pipeline while lower levels are consulted.",
          color: "#a855f7",
        },
      },
      {
        id: "writeback",
        type: "pipelineStage",
        position: { x: 880, y: 120 },
        data: {
          label: "Writeback",
          stage: 5,
          shortLabel: "WB",
          description:
            "Commit results to the register file and retire the instruction in-order. Exceptions and mispredicted branches are handled at retirement boundaries.",
          color: "#d946ef",
        },
      },
    ],
    edges: [
      {
        id: "fetch-decode",
        source: "fetch",
        target: "decode",
        type: "smoothstep",
        animated: true,
        data: { label: "instruction" },
      },
      {
        id: "decode-execute",
        source: "decode",
        target: "execute",
        type: "smoothstep",
        animated: true,
        data: { label: "operands" },
      },
      {
        id: "execute-memory",
        source: "execute",
        target: "memory",
        type: "smoothstep",
        animated: true,
        data: { label: "address / ALU" },
      },
      {
        id: "memory-writeback",
        source: "memory",
        target: "writeback",
        type: "smoothstep",
        animated: true,
        data: { label: "result" },
      },
    ],
    interaction: {
      stepThrough: true,
      fitViewOnLoad: true,
      nodesDraggable: false,
      panOnScroll: true,
      highlightActiveStage: true,
    },
  };

  await prisma.visualization.upsert({
    where: { slug: "cpu-pipeline" },
    create: {
      slug: "cpu-pipeline",
      title: "CPU Instruction Pipeline",
      renderer: "REACT_FLOW" satisfies VizRenderer,
      moduleSlug: "cpu",
      config,
    },
    update: {
      title: "CPU Instruction Pipeline",
      renderer: "REACT_FLOW",
      moduleSlug: "cpu",
      config,
    },
  });
}

async function seedSupplyChainVisualization(prisma: PrismaClient): Promise<void> {
  const config = {
    renderer: "REACT_FLOW" as const,
    layout: "dagre" as const,
    layoutOptions: {
      rankdir: "LR",
      nodesep: 80,
      ranksep: 140,
      marginx: 40,
      marginy: 40,
    },
    categoryColors: {
      FABLESS: "#3b82f6",
      IDM: "#6366f1",
      FOUNDRY: "#10b981",
      EDA: "#f59e0b",
      EQUIPMENT: "#ef4444",
      MATERIALS: "#84cc16",
      OSAT: "#14b8a6",
      IP: "#8b5cf6",
      CLOUD: "#06b6d4",
      OTHER: "#64748b",
    } satisfies Record<CompanyCategory, string>,
    edgeStyles: {
      SUPPLIES: { stroke: "#94a3b8", strokeWidth: 2 },
      CUSTOMER_OF: { stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "6 3" },
      PARTNERS_WITH: { stroke: "#10b981", strokeWidth: 2 },
    },
    filters: {
      defaultCategories: [
        "FOUNDRY",
        "FABLESS",
        "EQUIPMENT",
        "EDA",
        "IDM",
      ] satisfies CompanyCategory[],
      defaultEdgeTypes: ["SUPPLIES", "CUSTOMER_OF", "PARTNERS_WITH"],
      defaultDepth: 2,
    },
    interaction: {
      panOnScroll: true,
      fitViewOnLoad: true,
      nodesDraggable: false,
      showMinimap: true,
      showLegend: true,
    },
    nodeTypes: {
      COMPANY: "companyNode",
    },
  };

  await prisma.visualization.upsert({
    where: { slug: "supply-chain" },
    create: {
      slug: "supply-chain",
      title: "Semiconductor Supply Chain",
      renderer: "REACT_FLOW" satisfies VizRenderer,
      moduleSlug: "supply-chain",
      config,
    },
    update: {
      title: "Semiconductor Supply Chain",
      renderer: "REACT_FLOW",
      moduleSlug: "supply-chain",
      config,
    },
  });
}
