import { getProductsService } from "@/services/product.service";
import { NextRequest } from "next/server";

export async function getProductsController(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const type = params.get("type") as "experience" | "transport";

  const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 12)));

  const page = Math.max(1, Number(params.get("page") ?? 1));

  const provider = params.get("provider") === "true";
  const loc = params.get("loc") === "true";

  return await getProductsService(type, limit, page, provider ,loc);
}
