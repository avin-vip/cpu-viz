import type { ModuleSlug } from "@/lib/constants/modules";

export const LEARNING_PATH: ModuleSlug[] = [
  "fundamentals",
  "cpu",
  "memory",
  "gpu",
  "manufacturing",
  "hbm-ai",
  "supply-chain",
  "companies",
];

export function getNextModuleSlug(currentSlug: ModuleSlug): ModuleSlug | null {
  const index = LEARNING_PATH.indexOf(currentSlug);
  if (index === -1 || index === LEARNING_PATH.length - 1) {
    return null;
  }
  return LEARNING_PATH[index + 1];
}

export function getPreviousModuleSlug(
  currentSlug: ModuleSlug,
): ModuleSlug | null {
  const index = LEARNING_PATH.indexOf(currentSlug);
  if (index <= 0) {
    return null;
  }
  return LEARNING_PATH[index - 1];
}
