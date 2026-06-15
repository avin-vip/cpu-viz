import { LEARNING_PATH } from "@/lib/constants/learning-path";
import { MODULES } from "@/lib/constants/modules";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
}

export const learnNav: NavItem[] = LEARNING_PATH.map((slug) => {
  const meta = MODULES[slug];
  return {
    title: meta.title,
    href: `/${meta.slug}`,
    description: meta.description,
    icon: meta.icon,
  };
});

export const exploreNav: NavItem[] = [
  {
    title: "Dependency Graph",
    href: "/graph",
    description: "Interactive semiconductor dependency map",
    icon: "graph",
  },
];

export const marketingNav: NavItem[] = [
  { title: "Explorer", href: "/graph" },
];
