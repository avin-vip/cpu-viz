import type { NextRequest } from "next/server";

import { validationErrorResponse } from "@/lib/api/validation";
import { jsonResponse } from "@/lib/api/response";
import { lessonQuerySchema, slugParamSchema } from "@/lib/api/schemas";
import { getLesson } from "@/lib/content/get-lesson";
import { resolveLesson } from "@/lib/content/resolve-blocks";
import { apiError, apiSuccess } from "@/types/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const paramsResult = slugParamSchema.safeParse(await context.params);
  if (!paramsResult.success) {
    return validationErrorResponse(paramsResult.error);
  }

  const queryResult = lessonQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!queryResult.success) {
    return validationErrorResponse(queryResult.error);
  }

  const { slug } = paramsResult.data;
  const { moduleSlug } = queryResult.data;

  const lesson = await getLesson(moduleSlug, slug);
  if (!lesson) {
    return jsonResponse(
      apiError("NOT_FOUND", `Lesson "${slug}" not found in module "${moduleSlug}"`),
      404,
    );
  }

  const resolved = await resolveLesson(lesson);
  return jsonResponse(apiSuccess(resolved));
}
