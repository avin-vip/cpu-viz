import { getAllModules } from "@/lib/content/get-module";
import { jsonResponse } from "@/lib/api/response";
import { apiSuccess } from "@/types/api";

export async function GET() {
  const modules = await getAllModules();
  return jsonResponse(apiSuccess(modules));
}
