import type { GraphEdgeDisplay, GraphNodeDisplay } from "@/types/graph";

export type DependencyNodeType =
  | "COMPANY"
  | "TECHNOLOGY"
  | "PRODUCT"
  | "PROCESS"
  | "END_MARKET";

export type DependencyEdgeType =
  | "SUPPLIES"
  | "CUSTOMER_OF"
  | "PARTNERS_WITH"
  | "USES_TECHNOLOGY"
  | "MANUFACTURES"
  | "ENABLES"
  | "PART_OF"
  | "SERVES_MARKET"
  | "RELATED";

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  focusNode: string;
  highlightNodes: string[];
}

export interface KnowledgeGraphData {
  nodes: GraphNodeDisplay[];
  edges: GraphEdgeDisplay[];
  scenarios: ScenarioDefinition[];
}

export type TraceDirection = "upstream" | "downstream" | "both";

export const NODE_TYPE_LABELS: Record<DependencyNodeType, string> = {
  COMPANY: "Companies",
  TECHNOLOGY: "Technologies",
  PRODUCT: "Products",
  PROCESS: "Processes",
  END_MARKET: "End Markets",
};

export const NODE_TYPE_COLORS: Record<DependencyNodeType, string> = {
  COMPANY: "#3b82f6",
  TECHNOLOGY: "#a855f7",
  PRODUCT: "#2563eb",
  PROCESS: "#f97316",
  END_MARKET: "#22c55e",
};
