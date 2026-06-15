import { validationErrorResponse } from "@/lib/api/validation";
import { jsonResponse } from "@/lib/api/response";
import { slugParamSchema } from "@/lib/api/schemas";
import { getCompany } from "@/lib/companies/get-company";
import { apiError, apiSuccess } from "@/types/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const paramsResult = slugParamSchema.safeParse(await context.params);
  if (!paramsResult.success) {
    return validationErrorResponse(paramsResult.error);
  }

  const company = await getCompany(paramsResult.data.slug);
  if (!company) {
    return jsonResponse(
      apiError("NOT_FOUND", `Company "${paramsResult.data.slug}" not found`),
      404,
    );
  }

  return jsonResponse(apiSuccess(company));
}
