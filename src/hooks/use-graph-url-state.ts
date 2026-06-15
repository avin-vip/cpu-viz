"use client";

import type { CompanyCategory } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { DEFAULT_SUPPLY_CHAIN_DEPTH } from "@/types/graph";

export interface GraphUrlState {
  focus?: string;
  categories: CompanyCategory[];
  depth: number;
}

const COMPANY_CATEGORIES = new Set<string>([
  "FABLESS",
  "IDM",
  "FOUNDRY",
  "EDA",
  "EQUIPMENT",
  "MATERIALS",
  "OSAT",
  "IP",
  "CLOUD",
  "OTHER",
]);

function isCompanyCategory(value: string): value is CompanyCategory {
  return COMPANY_CATEGORIES.has(value);
}

function parseCategories(raw: string | string[] | undefined): CompanyCategory[] {
  if (!raw) {
    return [];
  }

  const values = Array.isArray(raw) ? raw : raw.split(",");
  const categories = values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toUpperCase())
    .filter(isCompanyCategory);

  return [...new Set(categories)];
}

function parseDepth(raw: string | undefined): number {
  if (!raw) {
    return DEFAULT_SUPPLY_CHAIN_DEPTH;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_SUPPLY_CHAIN_DEPTH;
  }

  return Math.min(parsed, 4);
}

export function parseGraphUrlState(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): GraphUrlState {
  const get = (key: string): string | string[] | undefined => {
    if (searchParams instanceof URLSearchParams) {
      const values = searchParams.getAll(key);
      if (values.length === 0) {
        return undefined;
      }
      if (values.length === 1) {
        return values[0];
      }
      return values;
    }

    return searchParams[key];
  };

  const focusRaw = get("focus");
  const focus =
    typeof focusRaw === "string"
      ? focusRaw
      : Array.isArray(focusRaw)
        ? focusRaw[0]
        : undefined;

  const categoryRaw = get("category");
  const depthRaw = get("depth");
  const depthString = Array.isArray(depthRaw) ? depthRaw[0] : depthRaw;

  return {
    focus: focus || undefined,
    categories: parseCategories(categoryRaw),
    depth: parseDepth(depthString),
  };
}

function buildSearchParams(state: GraphUrlState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.focus) {
    params.set("focus", state.focus);
  }

  for (const category of state.categories) {
    params.append("category", category);
  }

  if (state.depth !== DEFAULT_SUPPLY_CHAIN_DEPTH) {
    params.set("depth", String(state.depth));
  }

  return params;
}

export function useGraphUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseGraphUrlState(searchParams),
    [searchParams],
  );

  const updateState = useCallback(
    (partial: Partial<GraphUrlState>) => {
      const next: GraphUrlState = {
        ...state,
        ...partial,
      };

      const params = buildSearchParams(next);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, state],
  );

  const setFocus = useCallback(
    (focus?: string) => updateState({ focus }),
    [updateState],
  );

  const setCategories = useCallback(
    (categories: CompanyCategory[]) => updateState({ categories }),
    [updateState],
  );

  const setDepth = useCallback(
    (depth: number) => updateState({ depth }),
    [updateState],
  );

  return {
    state,
    setFocus,
    setCategories,
    setDepth,
    updateState,
  };
}
