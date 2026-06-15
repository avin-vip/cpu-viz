import type { Company, NodeType } from "@prisma/client";

import {
  COMPANY_CATEGORY_COLORS,
  COMPANY_CATEGORY_LABELS,
} from "@/lib/constants/categories";
import { prisma } from "@/lib/prisma/client";
import type { GraphNodeDisplay, NodeRef } from "@/types/graph";

function companyToNodeDisplay(company: Company): GraphNodeDisplay {
  return {
    id: company.id,
    type: "COMPANY",
    slug: company.slug,
    label: company.name,
    subtitle: company.ticker ?? undefined,
    description: company.description ?? undefined,
    category: COMPANY_CATEGORY_LABELS[company.category],
    color: COMPANY_CATEGORY_COLORS[company.category],
    href: `/companies/${company.slug}`,
    metadata: company.metadata
      ? (company.metadata as Record<string, unknown>)
      : undefined,
  };
}

export async function resolveNode(
  type: NodeType,
  id: string,
): Promise<GraphNodeDisplay | null> {
  if (type !== "COMPANY") {
    return null;
  }

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    return null;
  }

  return companyToNodeDisplay(company);
}

export async function resolveNodes(
  refs: NodeRef[],
): Promise<GraphNodeDisplay[]> {
  const companyIds = refs
    .filter((ref) => ref.type === "COMPANY")
    .map((ref) => ref.id);

  if (companyIds.length === 0) {
    return [];
  }

  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
  });

  const companyMap = new Map(companies.map((company) => [company.id, company]));

  return refs
    .filter((ref) => ref.type === "COMPANY")
    .map((ref) => companyMap.get(ref.id))
    .filter((company): company is Company => company !== undefined)
    .map(companyToNodeDisplay);
}

export async function resolveNodeBySlug(
  type: NodeType,
  slug: string,
): Promise<GraphNodeDisplay | null> {
  if (type !== "COMPANY") {
    return null;
  }

  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) {
    return null;
  }

  return companyToNodeDisplay(company);
}
