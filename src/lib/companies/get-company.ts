import type { CompanyCategory, EdgeType } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import type {
  CompanyListItem,
  CompanyProfile,
  CompanyRelationship,
  CompanyRelationships,
} from "@/types/company";

const SUPPLIER_EDGE_TYPES: EdgeType[] = ["SUPPLIES"];
const CUSTOMER_EDGE_TYPES: EdgeType[] = ["CUSTOMER_OF"];
const PARTNER_EDGE_TYPES: EdgeType[] = ["PARTNERS_WITH"];
const COMPETITOR_EDGE_TYPES: EdgeType[] = ["COMPETES_WITH"];

function categorizeRelationship(
  edgeType: EdgeType,
  direction: "inbound" | "outbound",
): keyof CompanyRelationships {
  if (edgeType === "SUPPLIES") {
    return direction === "inbound" ? "suppliers" : "customers";
  }
  if (edgeType === "CUSTOMER_OF") {
    return direction === "inbound" ? "customers" : "suppliers";
  }
  if (edgeType === "PARTNERS_WITH") {
    return "partners";
  }
  if (edgeType === "COMPETES_WITH") {
    return "competitors";
  }
  return "other";
}

function emptyRelationships(): CompanyRelationships {
  return {
    suppliers: [],
    customers: [],
    partners: [],
    competitors: [],
    other: [],
  };
}

export async function getCompany(slug: string): Promise<CompanyProfile | null> {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      facilities: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!company) {
    return null;
  }

  const edges = await prisma.graphEdge.findMany({
    where: {
      OR: [
        { sourceType: "COMPANY", sourceId: company.id },
        { targetType: "COMPANY", targetId: company.id },
      ],
    },
  });

  const relatedCompanyIds = new Set<string>();

  for (const edge of edges) {
    if (edge.sourceType === "COMPANY" && edge.sourceId !== company.id) {
      relatedCompanyIds.add(edge.sourceId);
    }
    if (edge.targetType === "COMPANY" && edge.targetId !== company.id) {
      relatedCompanyIds.add(edge.targetId);
    }
  }

  const relatedCompanies = await prisma.company.findMany({
    where: { id: { in: [...relatedCompanyIds] } },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      logoUrl: true,
    },
  });

  const companyMap = new Map(
    relatedCompanies.map((related) => [related.id, related]),
  );

  const relationships = emptyRelationships();

  for (const edge of edges) {
    const isOutbound =
      edge.sourceType === "COMPANY" && edge.sourceId === company.id;
    const isInbound =
      edge.targetType === "COMPANY" && edge.targetId === company.id;

    if (!isOutbound && !isInbound) {
      continue;
    }

    const relatedId = isOutbound ? edge.targetId : edge.sourceId;
    const related = companyMap.get(relatedId);

    if (!related || related.id === company.id) {
      continue;
    }

    const relationship: CompanyRelationship = {
      edgeType: edge.type,
      direction: isOutbound ? "outbound" : "inbound",
      company: related,
      label: edge.label,
      strength: edge.strength,
    };

    const bucket = categorizeRelationship(
      edge.type,
      relationship.direction,
    );
    relationships[bucket].push(relationship);
  }

  return {
    ...company,
    relationships,
  };
}

export async function listCompanies(
  category?: CompanyCategory,
): Promise<CompanyListItem[]> {
  return prisma.company.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      ticker: true,
      category: true,
      description: true,
      headquarters: true,
      logoUrl: true,
    },
  });
}

export {
  SUPPLIER_EDGE_TYPES,
  CUSTOMER_EDGE_TYPES,
  PARTNER_EDGE_TYPES,
  COMPETITOR_EDGE_TYPES,
};
