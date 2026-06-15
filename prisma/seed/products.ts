import type { PrismaClient, Prisma } from "@prisma/client";
import type { ProductCategory } from "@prisma/client";

type ProductSeed = {
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  companySlug: string;
  metadata?: Prisma.InputJsonValue;
};

const PRODUCTS: ProductSeed[] = [
  {
    slug: "h100",
    name: "NVIDIA H100",
    category: "AI_ACCELERATOR",
    description:
      "Hopper-architecture GPU with 80GB HBM3, designed for AI training and inference at datacenter scale. Manufactured by TSMC on 4N process.",
    companySlug: "nvidia",
    metadata: { processNode: "4N", memoryGb: 80, tdpW: 700, releaseYear: 2022 },
  },
  {
    slug: "geforce-rtx-4090",
    name: "GeForce RTX 4090",
    category: "GPU",
    description:
      "Ada Lovelace consumer GPU with 24GB GDDR6X, 16,384 CUDA cores, and dedicated ray-tracing and tensor cores.",
    companySlug: "nvidia",
    metadata: { processNode: "4N", memoryGb: 24, tdpW: 450, releaseYear: 2022 },
  },
  {
    slug: "apple-a17-pro",
    name: "Apple A17 Pro",
    category: "MOBILE_SOC",
    description:
      "3nm mobile SoC powering iPhone 15 Pro, with 6-core CPU, 6-core GPU, and 16-core Neural Engine. Fabricated by TSMC N3B.",
    companySlug: "apple",
    metadata: { processNode: "3nm", releaseYear: 2023 },
  },
  {
    slug: "apple-m3-max",
    name: "Apple M3 Max",
    category: "MOBILE_SOC",
    description:
      "Apple Silicon chip for MacBook Pro with up to 16-core CPU, 40-core GPU, and unified memory architecture on TSMC 3nm.",
    companySlug: "apple",
    metadata: { processNode: "3nm", releaseYear: 2023 },
  },
  {
    slug: "ryzen-9-7950x",
    name: "AMD Ryzen 9 7950X",
    category: "CPU",
    description:
      "Zen 4 desktop processor with 16 cores/32 threads, 5.7 GHz boost, and DDR5 support. Fabricated by TSMC on 5nm.",
    companySlug: "amd",
    metadata: { processNode: "5nm", cores: 16, tdpW: 170, releaseYear: 2022 },
  },
  {
    slug: "epyc-9654",
    name: "AMD EPYC 9654",
    category: "CPU",
    description:
      "Zen 4 datacenter processor with 96 cores, designed for cloud and enterprise workloads. TSMC 5nm fabrication.",
    companySlug: "amd",
    metadata: { processNode: "5nm", cores: 96, tdpW: 360, releaseYear: 2022 },
  },
  {
    slug: "snapdragon-8-gen-3",
    name: "Snapdragon 8 Gen 3",
    category: "MOBILE_SOC",
    description:
      "Qualcomm flagship mobile platform with Oryon CPU cores, Adreno GPU, and Hexagon NPU for on-device AI.",
    companySlug: "qualcomm",
    metadata: { processNode: "4nm", releaseYear: 2023 },
  },
  {
    slug: "exynos-2400",
    name: "Samsung Exynos 2400",
    category: "MOBILE_SOC",
    description:
      "Samsung Foundry 4LPP mobile SoC with deca-core CPU and Xclipse GPU, used in select Galaxy S24 variants.",
    companySlug: "samsung",
    metadata: { processNode: "4nm", releaseYear: 2024 },
  },
];

export const PRODUCT_COUNT = PRODUCTS.length;

export async function seedProducts(
  prisma: PrismaClient,
  companies: Record<string, string>,
): Promise<Record<string, string>> {
  const products: Record<string, string> = {};

  for (const product of PRODUCTS) {
    const companyId = companies[product.companySlug];
    if (!companyId) {
      throw new Error(
        `Product "${product.slug}" references unknown company slug "${product.companySlug}"`,
      );
    }

    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        category: product.category,
        description: product.description,
        companyId,
        metadata: product.metadata ?? undefined,
      },
      create: {
        slug: product.slug,
        name: product.name,
        category: product.category,
        description: product.description,
        companyId,
        metadata: product.metadata ?? undefined,
      },
    });

    products[product.slug] = record.id;
  }

  return products;
}
