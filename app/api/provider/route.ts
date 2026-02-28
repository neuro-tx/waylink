import { NextRequest } from "next/server";
import { providerController } from "@/controllers/provider.controller";
import { tryCatch } from "@/lib/handler";

export async function GET(req: NextRequest) {
  return tryCatch(async () => {
    return providerController.getProvider(req);
  });
}
