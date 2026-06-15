import type { VizConfig } from "@/types/visualization";

import { validationErrorResponse } from "@/lib/api/validation";
import { jsonResponse } from "@/lib/api/response";
import { slugParamSchema } from "@/lib/api/schemas";
import { prisma } from "@/lib/prisma/client";
import { apiError, apiSuccess } from "@/types/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const paramsResult = slugParamSchema.safeParse(await context.params);
  if (!paramsResult.success) {
    return validationErrorResponse(paramsResult.error);
  }

  const visualization = await prisma.visualization.findUnique({
    where: { slug: paramsResult.data.slug },
    select: {
      slug: true,
      title: true,
      renderer: true,
      config: true,
    },
  });

  if (!visualization) {
    return jsonResponse(
      apiError(
        "NOT_FOUND",
        `Visualization "${paramsResult.data.slug}" not found`,
      ),
      404,
    );
  }

  const config: VizConfig = {
    renderer: visualization.renderer,
    ...(visualization.config as Record<string, unknown>),
  } as VizConfig;

  return jsonResponse(
    apiSuccess({
      slug: visualization.slug,
      title: visualization.title,
      config,
    }),
  );
}
