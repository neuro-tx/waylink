import { NextRequest } from "next/server";
import { providerController } from "@/controllers/provider.controller";
import { tryCatch } from "@/lib/handler";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const role = (params.get("role")?.trim() as string) ?? "user";

  return tryCatch(
    req,
    async () => {
      return providerController.getProvider(req);
    },
    {
      role: role as any,
    },
  );
}
