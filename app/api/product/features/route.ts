import { tryCatch } from "@/lib/handler";
import { productSerices } from "@/services/product.service";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const type = params.get("type")?.trim() as "experience" | "transport";
  const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 4)));
  const page = Math.max(1, Number(params.get("page") ?? 1));

  return tryCatch(async () => {
    return productSerices.featuredProducts(type, limit, page);
  });
}
