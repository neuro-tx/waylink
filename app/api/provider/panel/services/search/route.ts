import { productController } from "@/controllers/product.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.url;
  console.log(url);
  return tryCatch(
    req,
    async () => {
      const res = await productController.productsSearch(url);
      return res;
    },
    { role: "provider" },
  );
}
