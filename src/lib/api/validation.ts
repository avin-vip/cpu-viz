import type { ZodError } from "zod";

import { apiError } from "@/types/api";

import { jsonResponse } from "./response";

export function validationErrorResponse(error: ZodError) {
  return jsonResponse(
    apiError("VALIDATION_ERROR", "Invalid request parameters", {
      issues: error.flatten(),
    }),
    400,
  );
}
