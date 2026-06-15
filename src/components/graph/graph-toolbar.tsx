"use client";

import type { CompanyCategory } from "@prisma/client";

import { COMPANY_CATEGORY_LIST } from "@/lib/constants/categories";
import { cn } from "@/lib/utils/cn";

interface GraphToolbarProps {
  selectedCategories: CompanyCategory[];
  onCategoriesChange: (categories: CompanyCategory[]) => void;
  className?: string;
}

export function GraphToolbar({
  selectedCategories,
  onCategoriesChange,
  className,
}: GraphToolbarProps) {
  const selectedSet = new Set(selectedCategories);
  const allSelected = selectedCategories.length === 0;

  function toggleCategory(category: CompanyCategory) {
    if (allSelected) {
      onCategoriesChange([category]);
      return;
    }

    const next = new Set(selectedSet);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }

    const values = [...next];
    onCategoriesChange(values.length === COMPANY_CATEGORY_LIST.length ? [] : values);
  }

  function selectAll() {
    onCategoriesChange([]);
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        className,
      )}
      role="region"
      aria-label="Graph filters"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          Filter by category
        </h2>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          {allSelected ? "All categories" : "Show all"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMPANY_CATEGORY_LIST.map((category) => {
          const isChecked = allSelected || selectedSet.has(category.value);

          return (
            <label
              key={category.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition",
                isChecked
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isChecked}
                onChange={() => toggleCategory(category.value)}
              />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden
              />
              {category.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
