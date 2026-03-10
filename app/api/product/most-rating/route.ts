import { tryCatch } from "@/lib/handler";
import { productSerices } from "@/services/product.service";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(async () => {
    const url = req.url;
    return productSerices.mostRatedProducts(url);
  });
}
