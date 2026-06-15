import type { PrismaClient, Prisma } from "@prisma/client";
import type { CompanyCategory, FacilityType } from "@prisma/client";

type FacilitySeed = {
  name: string;
  type: FacilityType;
  location: string;
  processNode?: string;
};

type CompanySeed = {
  slug: string;
  name: string;
  ticker?: string;
  category: CompanyCategory;
  description: string;
  headquarters: string;
  founded: number;
  website: string;
  metadata?: Prisma.InputJsonValue;
  facilities?: FacilitySeed[];
};

const COMPANIES: CompanySeed[] = [
  {
    slug: "tsmc",
    name: "Taiwan Semiconductor Manufacturing Company",
    ticker: "TSM",
    category: "FOUNDRY",
    description:
      "The world's largest dedicated semiconductor foundry. TSMC manufactures chips for Apple, NVIDIA, AMD, Qualcomm, and most leading fabless designers at advanced nodes from 3nm and below.",
    headquarters: "Hsinchu, Taiwan",
    founded: 1987,
    website: "https://www.tsmc.com",
    metadata: { employees: 73000, segments: ["leading-edge logic", "mature nodes", "packaging"] },
    facilities: [
      { name: "Fab 18", type: "FAB", location: "Tainan, Taiwan", processNode: "3nm" },
      { name: "Fab 15", type: "FAB", location: "Hsinchu, Taiwan", processNode: "7nm" },
      { name: "Fab 12", type: "FAB", location: "Hsinchu, Taiwan", processNode: "16nm" },
      { name: "Global Headquarters", type: "HQ", location: "Hsinchu, Taiwan" },
    ],
  },
  {
    slug: "intel",
    name: "Intel Corporation",
    ticker: "INTC",
    category: "IDM",
    description:
      "Integrated device manufacturer designing x86 CPUs and increasingly acting as a foundry (Intel Foundry Services). Historically dominated PC and server processors; investing heavily in EUV fabs in the US and Europe.",
    headquarters: "Santa Clara, California, USA",
    founded: 1968,
    website: "https://www.intel.com",
    metadata: { employees: 124000, segments: ["client compute", "datacenter", "foundry services"] },
    facilities: [
      { name: "Fab 42", type: "FAB", location: "Chandler, Arizona, USA", processNode: "Intel 4" },
      { name: "D1X Mod 3", type: "FAB", location: "Hillsboro, Oregon, USA", processNode: "Intel 3" },
      { name: "Ronler Acres", type: "R_AND_D", location: "Hillsboro, Oregon, USA" },
      { name: "Robert Noyce Building", type: "HQ", location: "Santa Clara, California, USA" },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung Electronics (Semiconductor)",
    ticker: "005930.KS",
    category: "IDM",
    description:
      "South Korean conglomerate with leading memory (DRAM, NAND) and foundry businesses. Manufactures Exynos mobile SoCs, supplies memory globally, and competes with TSMC at advanced logic nodes.",
    headquarters: "Suwon, South Korea",
    founded: 1969,
    website: "https://www.samsung.com/semiconductor",
    metadata: { employees: 267000, segments: ["memory", "foundry", "mobile SoC"] },
    facilities: [
      { name: "S5 Line", type: "FAB", location: "Pyeongtaek, South Korea", processNode: "3nm" },
      { name: "S3 Line", type: "FAB", location: "Hwaseong, South Korea", processNode: "5nm" },
      { name: "Giheung R&D Campus", type: "R_AND_D", location: "Yongin, South Korea" },
      { name: "Samsung Digital City", type: "HQ", location: "Suwon, South Korea" },
    ],
  },
  {
    slug: "asml",
    name: "ASML Holding",
    ticker: "ASML",
    category: "EQUIPMENT",
    description:
      "Monopoly supplier of extreme ultraviolet (EUV) lithography scanners required for sub-7nm patterning. Also produces DUV immersion systems. Every leading-edge fab depends on ASML tools.",
    headquarters: "Veldhoven, Netherlands",
    founded: 1984,
    website: "https://www.asml.com",
    metadata: { employees: 42000, segments: ["EUV", "DUV", "metrology"] },
    facilities: [
      { name: "Veldhoven Headquarters & EUV Assembly", type: "HQ", location: "Veldhoven, Netherlands" },
      { name: "Wilmington Technology Campus", type: "R_AND_D", location: "Wilmington, Connecticut, USA" },
      { name: "Linkou Manufacturing", type: "FAB", location: "Linkou, Taiwan" },
    ],
  },
  {
    slug: "nvidia",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    category: "FABLESS",
    description:
      "Dominant designer of GPUs for gaming, professional visualization, and AI acceleration. CUDA software ecosystem and H100/B100 data-center GPUs define the AI training market.",
    headquarters: "Santa Clara, California, USA",
    founded: 1993,
    website: "https://www.nvidia.com",
    metadata: { segments: ["datacenter GPU", "gaming", "automotive", "networking"] },
  },
  {
    slug: "amd",
    name: "Advanced Micro Devices",
    ticker: "AMD",
    category: "FABLESS",
    description:
      "Designs x86 CPUs (Ryzen, EPYC) and GPUs (Radeon, Instinct). Gained significant server share against Intel; AI accelerators (MI300) compete in the HPC/AI space.",
    headquarters: "Santa Clara, California, USA",
    founded: 1969,
    website: "https://www.amd.com",
    metadata: { segments: ["client CPU", "server CPU", "GPU", "adaptive SoC"] },
  },
  {
    slug: "apple",
    name: "Apple Inc. (Silicon)",
    ticker: "AAPL",
    category: "FABLESS",
    description:
      "Designs A-series and M-series SoCs for iPhone, iPad, and Mac. Vertical integration of CPU, GPU, Neural Engine, and unified memory architecture; manufactured exclusively at TSMC.",
    headquarters: "Cupertino, California, USA",
    founded: 1976,
    website: "https://www.apple.com",
    metadata: { segments: ["mobile SoC", "Mac SoC", "custom silicon"] },
  },
  {
    slug: "qualcomm",
    name: "Qualcomm Incorporated",
    ticker: "QCOM",
    category: "FABLESS",
    description:
      "Leader in mobile SoCs (Snapdragon) and wireless modems (5G). Designs ARM-based processors and licenses connectivity IP; fabs at TSMC and Samsung.",
    headquarters: "San Diego, California, USA",
    founded: 1985,
    website: "https://www.qualcomm.com",
    metadata: { segments: ["mobile SoC", "modem", "automotive", "IoT"] },
  },
  {
    slug: "broadcom",
    name: "Broadcom Inc.",
    ticker: "AVGO",
    category: "FABLESS",
    description:
      "Diversified semiconductor and infrastructure software company. Custom AI accelerators (Google TPU partnership), networking ASICs, and storage controllers.",
    headquarters: "Palo Alto, California, USA",
    founded: 1991,
    website: "https://www.broadcom.com",
    metadata: { segments: ["networking", "custom ASIC", "storage", "wireless"] },
  },
  {
    slug: "mediatek",
    name: "MediaTek Inc.",
    ticker: "2454.TW",
    category: "FABLESS",
    description:
      "World's largest mobile SoC vendor by unit volume. Designs Dimensity smartphone chips and Filogic connectivity solutions for mid-range and flagship devices.",
    headquarters: "Hsinchu, Taiwan",
    founded: 1997,
    website: "https://www.mediatek.com",
    metadata: { segments: ["mobile SoC", "connectivity", "smart TV", "IoT"] },
  },
  {
    slug: "marvell",
    name: "Marvell Technology",
    ticker: "MRVL",
    category: "FABLESS",
    description:
      "Designs data infrastructure semiconductors — custom AI accelerators, DPUs, storage controllers, and automotive Ethernet. Key supplier for cloud and enterprise networking.",
    headquarters: "Wilmington, Delaware, USA",
    founded: 1995,
    website: "https://www.marvell.com",
    metadata: { segments: ["datacenter", "automotive", "enterprise storage"] },
  },
  {
    slug: "globalfoundries",
    name: "GlobalFoundries",
    ticker: "GFS",
    category: "FOUNDRY",
    description:
      "US-based foundry focused on mature and specialty nodes (12nm–180nm) for automotive, IoT, and RF. Spun out from AMD; does not compete at leading-edge logic.",
    headquarters: "Malta, New York, USA",
    founded: 2009,
    website: "https://gf.com",
    metadata: { segments: ["automotive", "IoT", "RF-SOI", "FD-SOI"] },
    facilities: [
      { name: "Fab 8", type: "FAB", location: "Malta, New York, USA", processNode: "12nm" },
      { name: "Fab 1", type: "FAB", location: "Dresden, Germany", processNode: "22nm FD-SOI" },
    ],
  },
  {
    slug: "smic",
    name: "Semiconductor Manufacturing International Corporation",
    ticker: "0981.HK",
    category: "FOUNDRY",
    description:
      "China's largest pure-play foundry. Produces logic and specialty chips at mature nodes; subject to US export restrictions on advanced EUV equipment.",
    headquarters: "Shanghai, China",
    founded: 2000,
    website: "https://www.smics.com",
    metadata: { segments: ["mature logic", "mixed-signal", "power"] },
  },
  {
    slug: "synopsys",
    name: "Synopsys Inc.",
    ticker: "SNPS",
    category: "EDA",
    description:
      "Leading electronic design automation vendor. Fusion Design Platform spans RTL synthesis, place-and-route, verification, and increasingly silicon IP and multi-die design.",
    headquarters: "Sunnyvale, California, USA",
    founded: 1986,
    website: "https://www.synopsys.com",
    metadata: { segments: ["EDA", "IP", "security", "silicon lifecycle"] },
  },
  {
    slug: "cadence",
    name: "Cadence Design Systems",
    ticker: "CDNS",
    category: "EDA",
    description:
      "Major EDA and IP provider. Innovus implementation, Xcelium verification, and Tensilica DSP cores are widely used across fabless and IDM design flows.",
    headquarters: "San Jose, California, USA",
    founded: 1988,
    website: "https://www.cadence.com",
    metadata: { segments: ["EDA", "IP", "system design"] },
  },
  {
    slug: "siemens-eda",
    name: "Siemens EDA (Mentor Graphics)",
    category: "EDA",
    description:
      "Siemens Digital Industries Software division providing Calibre physical verification, Tessent DFT, and Veloce emulation — critical for sign-off and test at advanced nodes.",
    headquarters: "Wilsonville, Oregon, USA",
    founded: 1981,
    website: "https://eda.sw.siemens.com",
    metadata: { segments: ["physical verification", "DFT", "emulation", "PCB"] },
  },
  {
    slug: "applied-materials",
    name: "Applied Materials",
    ticker: "AMAT",
    category: "EQUIPMENT",
    description:
      "Largest semiconductor equipment company by revenue. Deposition (CVD, PVD, ECD), etch, ion implantation, and metrology tools are installed in virtually every fab worldwide.",
    headquarters: "Santa Clara, California, USA",
    founded: 1967,
    website: "https://www.appliedmaterials.com",
    metadata: { segments: ["deposition", "etch", "CMP", "inspection"] },
  },
  {
    slug: "lam-research",
    name: "Lam Research",
    ticker: "LRCX",
    category: "EQUIPMENT",
    description:
      "Specialist in wafer fabrication equipment for deposition, etch, and clean. Critical for 3D NAND staircase etch and advanced logic gate formation.",
    headquarters: "Fremont, California, USA",
    founded: 1980,
    website: "https://www.lamresearch.com",
    metadata: { segments: ["etch", "deposition", "clean"] },
  },
  {
    slug: "kla",
    name: "KLA Corporation",
    ticker: "KLAC",
    category: "EQUIPMENT",
    description:
      "Dominant process control and yield management company. Optical and e-beam inspection, overlay metrology, and defect review tools are essential for high-yield manufacturing.",
    headquarters: "Milpitas, California, USA",
    founded: 1975,
    website: "https://www.kla.com",
    metadata: { segments: ["inspection", "metrology", "process control"] },
  },
  {
    slug: "tokyo-electron",
    name: "Tokyo Electron Limited",
    ticker: "8035.T",
    category: "EQUIPMENT",
    description:
      "Japanese semiconductor production equipment maker. Coater/developer track systems, etch, and deposition tools — especially strong in memory fab installations.",
    headquarters: "Tokyo, Japan",
    founded: 1963,
    website: "https://www.tel.com",
    metadata: { segments: ["track", "etch", "deposition", "clean"] },
  },
  {
    slug: "shin-etsu",
    name: "Shin-Etsu Chemical (Silicon Division)",
    ticker: "4063.T",
    category: "MATERIALS",
    description:
      "World's largest producer of silicon wafers and PVC. Shin-Etsu Handotai supplies polished and epitaxial wafers that are the substrate for all front-end fabrication.",
    headquarters: "Tokyo, Japan",
    founded: 1926,
    website: "https://www.shinetsu.co.jp",
    metadata: { segments: ["300mm wafers", "epitaxial wafers", "SOI"] },
  },
  {
    slug: "sumco",
    name: "SUMCO Corporation",
    ticker: "3436.T",
    category: "MATERIALS",
    description:
      "Major silicon wafer manufacturer alongside Shin-Etsu. Supplies 200mm and 300mm wafers to foundries and memory makers globally.",
    headquarters: "Tokyo, Japan",
    founded: 1999,
    website: "https://www.sumcosi.com",
    metadata: { segments: ["300mm wafers", "specialty wafers"] },
  },
  {
    slug: "ase-technology",
    name: "ASE Technology Holding",
    ticker: "3711.TW",
    category: "OSAT",
    description:
      "World's largest outsourced semiconductor assembly and test (OSAT) provider. Packages and tests chips for fabless companies after wafer fabrication.",
    headquarters: "Kaohsiung, Taiwan",
    founded: 1984,
    website: "https://www.aseglobal.com",
    metadata: { segments: ["advanced packaging", "wire bond", "test services"] },
    facilities: [
      { name: "Kaohsiung Nanzih Campus", type: "OSAT", location: "Kaohsiung, Taiwan" },
      { name: "Chungli Facility", type: "OSAT", location: "Taoyuan, Taiwan" },
    ],
  },
  {
    slug: "amkor",
    name: "Amkor Technology",
    ticker: "AMKR",
    category: "OSAT",
    description:
      "US-headquartered OSAT specializing in advanced flip-chip, wafer-level, and 2.5D packaging for mobile, automotive, and high-performance computing.",
    headquarters: "Tempe, Arizona, USA",
    founded: 1968,
    website: "https://www.amkor.com",
    metadata: { segments: ["flip-chip", "WLP", "SiP", "test"] },
  },
  {
    slug: "arm",
    name: "Arm Holdings",
    ticker: "ARM",
    category: "IP",
    description:
      "Architect of the ARM instruction set licensed to virtually every mobile SoC designer. CPU, GPU (Mali), and system IP power billions of devices; increasingly entering PC and datacenter.",
    headquarters: "Cambridge, United Kingdom",
    founded: 1990,
    website: "https://www.arm.com",
    metadata: { segments: ["CPU IP", "GPU IP", "system IP", "automotive"] },
  },
  {
    slug: "aws",
    name: "Amazon Web Services (Annapurna / Graviton)",
    category: "CLOUD",
    description:
      "Cloud provider designing custom Graviton ARM CPUs and Trainium/Inferentia AI accelerators. Vertical integration reduces datacenter cost and differentiates AWS compute offerings.",
    headquarters: "Seattle, Washington, USA",
    founded: 2006,
    website: "https://aws.amazon.com",
    metadata: { segments: ["Graviton CPU", "Trainium", "Inferentia", "cloud infrastructure"] },
  },
  {
    slug: "google",
    name: "Google (Custom Silicon)",
    category: "CLOUD",
    description:
      "Designs Tensor Processing Units (TPUs) for internal AI workloads and Tensor mobile SoCs for Pixel devices. Increasingly a fabless silicon designer alongside its cloud business.",
    headquarters: "Mountain View, California, USA",
    founded: 1998,
    website: "https://cloud.google.com/tpu",
    metadata: { segments: ["TPU", "Tensor SoC", "cloud AI"] },
  },
];

export async function seedCompanies(prisma: PrismaClient): Promise<Record<string, string>> {
  const companies: Record<string, string> = {};

  for (const company of COMPANIES) {
    const record = await prisma.company.upsert({
      where: { slug: company.slug },
      create: {
        slug: company.slug,
        name: company.name,
        ticker: company.ticker ?? null,
        category: company.category,
        description: company.description,
        headquarters: company.headquarters,
        founded: company.founded,
        website: company.website,
        metadata: company.metadata ?? undefined,
      },
      update: {
        name: company.name,
        ticker: company.ticker ?? null,
        category: company.category,
        description: company.description,
        headquarters: company.headquarters,
        founded: company.founded,
        website: company.website,
        metadata: company.metadata ?? undefined,
      },
    });

    companies[company.slug] = record.id;

    if (company.facilities) {
      for (const facility of company.facilities) {
        const existing = await prisma.facility.findFirst({
          where: { companyId: record.id, name: facility.name },
        });

        if (existing) {
          await prisma.facility.update({
            where: { id: existing.id },
            data: {
              type: facility.type,
              location: facility.location,
              processNode: facility.processNode ?? null,
            },
          });
        } else {
          await prisma.facility.create({
            data: {
              name: facility.name,
              type: facility.type,
              location: facility.location,
              processNode: facility.processNode ?? null,
              companyId: record.id,
            },
          });
        }
      }
    }
  }

  return companies;
}
