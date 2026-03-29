import { type NextRequest } from "next/server";
import { tryCatch } from "@/lib/handler";
import { providerController } from "@/controllers/provider.controller";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return tryCatch(async () => {
    const { id } = await params;

    const provider = await providerController.getProviderById(id);
    const status = await providerController.providerStatus(id);

    return {
      provider,
      status,
    };
  });
}
