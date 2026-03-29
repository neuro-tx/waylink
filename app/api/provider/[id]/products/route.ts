import { NextRequest } from "next/server";
import { tryCatch } from "@/lib/handler";
import { providerController } from "@/controllers/provider.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return tryCatch(async () => {
    const { id } = await params;
    const parameters = req.nextUrl.searchParams;

    const limitParam = Number(parameters.get("limit")?.trim());
    const limit = isNaN(limitParam) || limitParam <= 0 ? 7 : limitParam;

    const showParam = parameters.get("show_all")?.trim();
    const show = showParam === "true";
    
    const pageParam = parameters.get("page");
    const page = pageParam ? Math.max(Number(pageParam.trim()) || 1, 1) : 1;

    return await providerController.providerProducts(id, limit, show, page);
  });
}
