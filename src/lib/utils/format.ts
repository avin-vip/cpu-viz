import type { CompanyCategory } from "@prisma/client";

import { COMPANY_CATEGORY_LABELS } from "@/lib/constants/categories";

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullNumberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(
  value: number,
  options?: { compact?: boolean },
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (options?.compact === false) {
    return fullNumberFormatter.format(value);
  }

  return numberFormatter.format(value);
}

export function formatCategory(category: CompanyCategory): string {
  return COMPANY_CATEGORY_LABELS[category];
}
