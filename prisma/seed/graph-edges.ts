import type { PrismaClient, Prisma } from "@prisma/client";
import type { EdgeType, NodeType } from "@prisma/client";

type GraphEdgeSeed = {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  strength: number;
  metadata?: Prisma.InputJsonValue;
};

const NODE_TYPE: NodeType = "COMPANY";

const EDGES: GraphEdgeSeed[] = [
  // ─── Equipment → Foundries / IDMs (SUPPLIES) ─────────────────
  { source: "asml", target: "tsmc", type: "SUPPLIES", label: "EUV scanners", strength: 5, metadata: { critical: true } },
  { source: "asml", target: "intel", type: "SUPPLIES", label: "EUV scanners", strength: 5, metadata: { critical: true } },
  { source: "asml", target: "samsung", type: "SUPPLIES", label: "EUV scanners", strength: 5, metadata: { critical: true } },
  { source: "asml", target: "globalfoundries", type: "SUPPLIES", label: "DUV systems", strength: 3 },
  { source: "applied-materials", target: "tsmc", type: "SUPPLIES", label: "Deposition & etch", strength: 5 },
  { source: "applied-materials", target: "intel", type: "SUPPLIES", label: "Deposition & etch", strength: 5 },
  { source: "applied-materials", target: "samsung", type: "SUPPLIES", label: "Deposition & etch", strength: 5 },
  { source: "applied-materials", target: "globalfoundries", type: "SUPPLIES", label: "Deposition tools", strength: 4 },
  { source: "applied-materials", target: "smic", type: "SUPPLIES", label: "Mature-node tools", strength: 3 },
  { source: "lam-research", target: "tsmc", type: "SUPPLIES", label: "Etch systems", strength: 5 },
  { source: "lam-research", target: "samsung", type: "SUPPLIES", label: "3D NAND etch", strength: 5 },
  { source: "lam-research", target: "intel", type: "SUPPLIES", label: "Etch systems", strength: 4 },
  { source: "lam-research", target: "globalfoundries", type: "SUPPLIES", label: "Etch systems", strength: 3 },
  { source: "kla", target: "tsmc", type: "SUPPLIES", label: "Inspection & metrology", strength: 5 },
  { source: "kla", target: "intel", type: "SUPPLIES", label: "Process control", strength: 5 },
  { source: "kla", target: "samsung", type: "SUPPLIES", label: "Yield management", strength: 5 },
  { source: "kla", target: "globalfoundries", type: "SUPPLIES", label: "Defect inspection", strength: 3 },
  { source: "tokyo-electron", target: "tsmc", type: "SUPPLIES", label: "Coater/developer tracks", strength: 5 },
  { source: "tokyo-electron", target: "samsung", type: "SUPPLIES", label: "Track systems", strength: 5 },
  { source: "tokyo-electron", target: "intel", type: "SUPPLIES", label: "Track systems", strength: 4 },
  { source: "tokyo-electron", target: "smic", type: "SUPPLIES", label: "Track systems", strength: 3 },

  // ─── Materials → Manufacturers (SUPPLIES) ────────────────────
  { source: "shin-etsu", target: "tsmc", type: "SUPPLIES", label: "300mm silicon wafers", strength: 5 },
  { source: "shin-etsu", target: "intel", type: "SUPPLIES", label: "Silicon wafers", strength: 4 },
  { source: "shin-etsu", target: "samsung", type: "SUPPLIES", label: "Silicon wafers", strength: 5 },
  { source: "shin-etsu", target: "globalfoundries", type: "SUPPLIES", label: "Silicon wafers", strength: 3 },
  { source: "sumco", target: "tsmc", type: "SUPPLIES", label: "Silicon wafers", strength: 4 },
  { source: "sumco", target: "samsung", type: "SUPPLIES", label: "Silicon wafers", strength: 4 },
  { source: "sumco", target: "intel", type: "SUPPLIES", label: "Silicon wafers", strength: 3 },

  // ─── EDA → Fabless / IDM designers (SUPPLIES) ────────────────
  { source: "synopsys", target: "nvidia", type: "SUPPLIES", label: "Design & verification tools", strength: 5 },
  { source: "synopsys", target: "amd", type: "SUPPLIES", label: "Fusion design platform", strength: 5 },
  { source: "synopsys", target: "qualcomm", type: "SUPPLIES", label: "RTL-to-GDSII flow", strength: 5 },
  { source: "synopsys", target: "apple", type: "SUPPLIES", label: "Sign-off & IP", strength: 5 },
  { source: "synopsys", target: "intel", type: "SUPPLIES", label: "EDA tools", strength: 4 },
  { source: "synopsys", target: "broadcom", type: "SUPPLIES", label: "Design tools", strength: 4 },
  { source: "cadence", target: "nvidia", type: "SUPPLIES", label: "Implementation & verification", strength: 5 },
  { source: "cadence", target: "amd", type: "SUPPLIES", label: "Innovus & Xcelium", strength: 5 },
  { source: "cadence", target: "qualcomm", type: "SUPPLIES", label: "Design flow", strength: 4 },
  { source: "cadence", target: "apple", type: "SUPPLIES", label: "Custom silicon design", strength: 5 },
  { source: "cadence", target: "mediatek", type: "SUPPLIES", label: "Mobile SoC design", strength: 4 },
  { source: "siemens-eda", target: "intel", type: "SUPPLIES", label: "Calibre physical verification", strength: 4 },
  { source: "siemens-eda", target: "tsmc", type: "SUPPLIES", label: "DFT & emulation", strength: 3 },
  { source: "siemens-eda", target: "samsung", type: "SUPPLIES", label: "Verification tools", strength: 3 },

  // ─── IP licensing (PARTNERS_WITH) ────────────────────────────
  { source: "arm", target: "apple", type: "PARTNERS_WITH", label: "CPU architecture license", strength: 5 },
  { source: "arm", target: "qualcomm", type: "PARTNERS_WITH", label: "Mobile CPU IP", strength: 5 },
  { source: "arm", target: "nvidia", type: "PARTNERS_WITH", label: "Grace CPU / automotive", strength: 3 },
  { source: "arm", target: "mediatek", type: "PARTNERS_WITH", label: "Dimensity CPU cores", strength: 5 },
  { source: "arm", target: "samsung", type: "PARTNERS_WITH", label: "Exynos CPU IP", strength: 4 },
  { source: "arm", target: "aws", type: "PARTNERS_WITH", label: "Graviton Neoverse", strength: 4 },
  { source: "arm", target: "google", type: "PARTNERS_WITH", label: "Tensor & cloud CPUs", strength: 3 },
  { source: "arm", target: "amd", type: "PARTNERS_WITH", label: "Embedded & custom", strength: 2 },

  // ─── Fabless → Foundries (CUSTOMER_OF) ───────────────────────
  { source: "nvidia", target: "tsmc", type: "CUSTOMER_OF", label: "GPU & AI accelerators", strength: 5, metadata: { revenue_pct: 11 } },
  { source: "amd", target: "tsmc", type: "CUSTOMER_OF", label: "CPU & GPU", strength: 5 },
  { source: "apple", target: "tsmc", type: "CUSTOMER_OF", label: "A/M-series SoCs", strength: 5, metadata: { revenue_pct: 25 } },
  { source: "qualcomm", target: "tsmc", type: "CUSTOMER_OF", label: "Snapdragon SoCs", strength: 5 },
  { source: "qualcomm", target: "samsung", type: "CUSTOMER_OF", label: "Alternate fab source", strength: 3 },
  { source: "mediatek", target: "tsmc", type: "CUSTOMER_OF", label: "Dimensity chips", strength: 5 },
  { source: "broadcom", target: "tsmc", type: "CUSTOMER_OF", label: "Networking ASICs", strength: 4 },
  { source: "marvell", target: "tsmc", type: "CUSTOMER_OF", label: "Datacenter silicon", strength: 4 },
  { source: "google", target: "tsmc", type: "CUSTOMER_OF", label: "TPU fabrication", strength: 4 },
  { source: "google", target: "samsung", type: "CUSTOMER_OF", label: "Tensor mobile SoC", strength: 3 },
  { source: "aws", target: "tsmc", type: "CUSTOMER_OF", label: "Graviton & Trainium", strength: 4 },
  { source: "nvidia", target: "samsung", type: "CUSTOMER_OF", label: "Legacy GPU nodes", strength: 2 },
  { source: "amd", target: "globalfoundries", type: "CUSTOMER_OF", label: "Mature I/O dies", strength: 2 },

  // ─── Strategic partnerships ───────────────────────────────────
  { source: "tsmc", target: "asml", type: "PARTNERS_WITH", label: "EUV co-development", strength: 5 },
  { source: "intel", target: "asml", type: "PARTNERS_WITH", label: "High-NA EUV early access", strength: 4 },
  { source: "samsung", target: "asml", type: "PARTNERS_WITH", label: "EUV volume production", strength: 4 },
  { source: "nvidia", target: "tsmc", type: "PARTNERS_WITH", label: "CoWoS advanced packaging", strength: 5 },
  { source: "apple", target: "tsmc", type: "PARTNERS_WITH", label: "Leading-node allocation", strength: 5 },
  { source: "amd", target: "tsmc", type: "PARTNERS_WITH", label: "N3/N4 process engagement", strength: 4 },
  { source: "intel", target: "synopsys", type: "PARTNERS_WITH", label: "IFS design ecosystem", strength: 3 },
  { source: "intel", target: "cadence", type: "PARTNERS_WITH", label: "IFS enablement", strength: 3 },

  // ─── OSAT packaging (SUPPLIES to fabless via assembly) ───────
  { source: "ase-technology", target: "nvidia", type: "SUPPLIES", label: "GPU packaging & test", strength: 4 },
  { source: "ase-technology", target: "amd", type: "SUPPLIES", label: "Chip packaging", strength: 4 },
  { source: "ase-technology", target: "qualcomm", type: "SUPPLIES", label: "Mobile packaging", strength: 5 },
  { source: "ase-technology", target: "mediatek", type: "SUPPLIES", label: "OSAT services", strength: 4 },
  { source: "amkor", target: "nvidia", type: "SUPPLIES", label: "Advanced flip-chip", strength: 3 },
  { source: "amkor", target: "qualcomm", type: "SUPPLIES", label: "SiP packaging", strength: 4 },
  { source: "amkor", target: "apple", type: "SUPPLIES", label: "Module packaging", strength: 3 },
  { source: "amkor", target: "broadcom", type: "SUPPLIES", label: "Networking packages", strength: 3 },

  // ─── Cloud / custom silicon relationships ────────────────────
  { source: "google", target: "broadcom", type: "PARTNERS_WITH", label: "TPU co-design", strength: 4 },
  { source: "aws", target: "amd", type: "PARTNERS_WITH", label: "EPYC cloud instances", strength: 3 },
  { source: "nvidia", target: "aws", type: "PARTNERS_WITH", label: "GPU cloud instances", strength: 4 },
  { source: "nvidia", target: "google", type: "PARTNERS_WITH", label: "Cloud AI infrastructure", strength: 3 },
];

export async function seedGraphEdges(
  prisma: PrismaClient,
  companies: Record<string, string>,
): Promise<void> {
  const seen = new Set<string>();

  for (const edge of EDGES) {
    if (!companies[edge.source]) {
      throw new Error(`Graph edge source company "${edge.source}" not found in database.`);
    }
    if (!companies[edge.target]) {
      throw new Error(`Graph edge target company "${edge.target}" not found in database.`);
    }

    const key = `${edge.source}|${edge.target}|${edge.type}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate graph edge: ${key}`);
    }
    seen.add(key);

    await prisma.graphEdge.upsert({
      where: {
        sourceType_sourceId_targetType_targetId_type: {
          sourceType: NODE_TYPE,
          sourceId: edge.source,
          targetType: NODE_TYPE,
          targetId: edge.target,
          type: edge.type,
        },
      },
      create: {
        type: edge.type,
        sourceType: NODE_TYPE,
        sourceId: edge.source,
        targetType: NODE_TYPE,
        targetId: edge.target,
        label: edge.label ?? null,
        strength: edge.strength,
        metadata: edge.metadata ?? undefined,
      },
      update: {
        label: edge.label ?? null,
        strength: edge.strength,
        metadata: edge.metadata ?? undefined,
      },
    });
  }
}

export const GRAPH_EDGE_COUNT = EDGES.length;
