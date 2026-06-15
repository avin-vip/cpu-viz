import type { CompanyCategory, EdgeType, NodeType } from "@prisma/client";

export type { EdgeType, NodeType };

export interface GraphNodeDisplay {
  id: string;
  type: NodeType | "END_MARKET";
  slug: string;
  label: string;
  subtitle?: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  href?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdgeDisplay {
  id: string;
  type: EdgeType | "SERVES_MARKET";
  source: string;
  target: string;
  label?: string;
  strength: number;
  metadata?: Record<string, unknown>;
}

export interface GraphPayload {
  nodes: GraphNodeDisplay[];
  edges: GraphEdgeDisplay[];
}

export interface SupplyChainFilters {
  focus?: string;
  depth?: number;
  categories?: CompanyCategory[];
  edgeTypes?: EdgeType[];
}

export interface NodeRef {
  type: NodeType;
  id: string;
}

export const SUPPLY_CHAIN_EDGE_TYPES: EdgeType[] = [
  "SUPPLIES",
  "CUSTOMER_OF",
  "PARTNERS_WITH",
];

export const DEFAULT_SUPPLY_CHAIN_DEPTH = 2;
