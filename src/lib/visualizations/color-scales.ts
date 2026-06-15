import type { CompanyCategory } from "@prisma/client";

import {
  COMPANY_CATEGORY_COLORS,
  COMPANY_CATEGORY_CSS_VARS,
  COMPANY_CATEGORY_LABELS,
} from "@/lib/constants/categories";

export function getCategoryColor(category: CompanyCategory): string {
  return COMPANY_CATEGORY_COLORS[category];
}

export function getCategoryCssVar(category: CompanyCategory): string {
  return COMPANY_CATEGORY_CSS_VARS[category];
}

export function getCategoryLabel(category: CompanyCategory): string {
  return COMPANY_CATEGORY_LABELS[category];
}

export function getCategoryColorByLabel(label: string): string | undefined {
  const entry = (
    Object.entries(COMPANY_CATEGORY_LABELS) as [CompanyCategory, string][]
  ).find(([, categoryLabel]) => categoryLabel === label);

  return entry ? COMPANY_CATEGORY_COLORS[entry[0]] : undefined;
}

export function buildCategoryColorMap(): Record<CompanyCategory, string> {
  return { ...COMPANY_CATEGORY_COLORS };
}

export function buildCategoryCssVarMap(): Record<CompanyCategory, string> {
  return { ...COMPANY_CATEGORY_CSS_VARS };
}
