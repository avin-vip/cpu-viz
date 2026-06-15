import type { NextRequest } from "next/server";

import { validationErrorResponse } from "@/lib/api/validation";
import { jsonResponse } from "@/lib/api/response";
import { companiesQuerySchema } from "@/lib/api/schemas";
import { listCompanies } from "@/lib/companies/get-company";
import { apiSuccess } from "@/types/api";

export async function GET(request: NextRequest) {
  const queryResult = companiesQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!queryResult.success) {
    return validationErrorResponse(queryResult.error);
  }

  const companies = await listCompanies(queryResult.data.category);
  return jsonResponse(apiSuccess(companies));
}
