import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";
import { productController } from "@/controllers/product.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  return tryCatch(req, async () => {
    return await productController.getProduct(id);
  });
}
