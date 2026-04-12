import { productController } from "@/controllers/product.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(req ,async () => {
    const res = await productController.getProducts(req);
    return res;
  });
}
