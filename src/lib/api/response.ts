import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types/api";

export const CACHE_CONTROL = "s-maxage=60, stale-while-revalidate=300";

export function jsonResponse<T>(
  body: ApiResponse<T>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": CACHE_CONTROL,
    },
  });
}
