import { getServiceAnalytics } from "@/controllers/analytics.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return tryCatch(req, async () => {
    const { id } = await params;

    return await getServiceAnalytics(id);
  });
}
