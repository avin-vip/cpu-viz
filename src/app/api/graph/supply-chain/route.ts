import type { NextRequest } from "next/server";

import { validationErrorResponse } from "@/lib/api/validation";
import { jsonResponse } from "@/lib/api/response";
import { supplyChainQuerySchema } from "@/lib/api/schemas";
import { getSupplyChainSubgraph } from "@/lib/graph/get-subgraph";
import { toReactFlow } from "@/lib/visualizations/to-react-flow";
import { apiSuccess } from "@/types/api";

export async function GET(request: NextRequest) {
  const queryResult = supplyChainQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!queryResult.success) {
    return validationErrorResponse(queryResult.error);
  }

  const { focus, depth, category } = queryResult.data;

  const subgraph = await getSupplyChainSubgraph({
    focus,
    depth,
    categories: category ? [category] : undefined,
  });

  const payload = toReactFlow(subgraph.nodes, subgraph.edges);

  return jsonResponse(apiSuccess(payload));
}
