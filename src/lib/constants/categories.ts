import type { CompanyCategory } from "@prisma/client";

export interface CategoryStyle {
  label: string;
  color: string;
  cssVar: string;
}

export const COMPANY_CATEGORY_LABELS: Record<CompanyCategory, string> = {
  FABLESS: "Fabless",
  IDM: "IDM",
  FOUNDRY: "Foundry",
  EDA: "EDA",
  EQUIPMENT: "Equipment",
  MATERIALS: "Materials",
  OSAT: "OSAT",
  IP: "IP",
  CLOUD: "Cloud",
  OTHER: "Other",
};

export const COMPANY_CATEGORY_COLORS: Record<CompanyCategory, string> = {
  FABLESS: "#3b82f6",
  IDM: "#8b5cf6",
  FOUNDRY: "#06b6d4",
  EDA: "#f59e0b",
  EQUIPMENT: "#10b981",
  MATERIALS: "#84cc16",
  OSAT: "#ec4899",
  IP: "#6366f1",
  CLOUD: "#14b8a6",
  OTHER: "#94a3b8",
};

export const COMPANY_CATEGORY_CSS_VARS: Record<CompanyCategory, string> = {
  FABLESS: "var(--viz-node-fabless)",
  IDM: "var(--viz-node-idm)",
  FOUNDRY: "var(--viz-node-foundry)",
  EDA: "var(--viz-node-eda)",
  EQUIPMENT: "var(--viz-node-equipment)",
  MATERIALS: "var(--viz-node-materials)",
  OSAT: "var(--viz-node-osat)",
  IP: "var(--viz-node-ip)",
  CLOUD: "var(--viz-node-cloud)",
  OTHER: "var(--viz-node-other)",
};

export const COMPANY_CATEGORIES: Record<CompanyCategory, CategoryStyle> =
  Object.fromEntries(
    (Object.keys(COMPANY_CATEGORY_LABELS) as CompanyCategory[]).map(
      (category) => [
        category,
        {
          label: COMPANY_CATEGORY_LABELS[category],
          color: COMPANY_CATEGORY_COLORS[category],
          cssVar: COMPANY_CATEGORY_CSS_VARS[category],
        },
      ],
    ),
  ) as Record<CompanyCategory, CategoryStyle>;

export const COMPANY_CATEGORY_LIST = (
  Object.keys(COMPANY_CATEGORIES) as CompanyCategory[]
).map((category) => ({
  value: category,
  ...COMPANY_CATEGORIES[category],
}));
