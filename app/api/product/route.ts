import { getProductsController } from "@/controllers/product.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(async () => {
    const res = await getProductsController(req);
    return res
  });
}
