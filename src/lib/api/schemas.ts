import { CompanyCategory } from "@prisma/client";
import { z } from "zod";

export const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const lessonQuerySchema = z.object({
  moduleSlug: z.string().min(1, "moduleSlug is required"),
});

export const supplyChainQuerySchema = z.object({
  focus: z.string().min(1).optional(),
  depth: z.coerce.number().int().min(1).max(5).optional(),
  category: z.nativeEnum(CompanyCategory).optional(),
});

export const companiesQuerySchema = z.object({
  category: z.nativeEnum(CompanyCategory).optional(),
});
