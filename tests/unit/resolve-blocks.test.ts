import { describe, expect, it } from "vitest";

import {
  extractConceptSlugs,
  replaceConceptLinks,
} from "@/lib/content/resolve-blocks";
import type { ConceptLink } from "@/types/content";

describe("extractConceptSlugs", () => {
  it("extracts a single concept slug", () => {
    expect(extractConceptSlugs("Learn about [[transistor]] basics.")).toEqual([
      "transistor",
    ]);
  });

  it("extracts multiple unique slugs", () => {
    const markdown =
      "Compare [[mosfet]] and [[cmos]] with [[transistor]] again.";
    expect(extractConceptSlugs(markdown)).toEqual([
      "mosfet",
      "cmos",
      "transistor",
    ]);
  });

  it("deduplicates repeated slugs", () => {
    expect(
      extractConceptSlugs("[[wafer]] processing uses [[wafer]] polishing."),
    ).toEqual(["wafer"]);
  });

  it("normalizes slugs to lowercase", () => {
    expect(extractConceptSlugs("See [[MOSFET]] and [[MoSfEt]].")).toEqual([
      "mosfet",
    ]);
  });

  it("ignores invalid bracket patterns", () => {
    expect(
      extractConceptSlugs("Not a link: [transistor] or [[bad slug]]."),
    ).toEqual([]);
  });

  it("matches lowercase slugs case-insensitively", () => {
    expect(extractConceptSlugs("See [[MOSFET]] design.")).toEqual(["mosfet"]);
  });

  it("supports hyphenated slugs", () => {
    expect(extractConceptSlugs("Study [[logic-gate]] design.")).toEqual([
      "logic-gate",
    ]);
  });
});

describe("replaceConceptLinks", () => {
  it("replaces wiki links with markdown links", () => {
    const links: ConceptLink[] = [
      {
        slug: "transistor",
        term: "Transistor",
        href: "/concepts/transistor",
      },
    ];

    expect(
      replaceConceptLinks("A [[transistor]] switches current.", links),
    ).toBe("A [Transistor](/concepts/transistor) switches current.");
  });

  it("leaves unknown slugs unchanged", () => {
    expect(replaceConceptLinks("Unknown [[missing]] term.", [])).toBe(
      "Unknown [[missing]] term.",
    );
  });
});
