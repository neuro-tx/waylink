import { BusinessType, ProviderStatus } from "@/lib/all-types";
import { providerService } from "@/services/provider.service";
import { NextRequest } from "next/server";

const getProvider = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const type = params.get("type") as
    | "transport"
    | "accommodation"
    | "experience";

  const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 4)));
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const offset = (page - 1) * limit;

  const status = (params.get("status")?.trim() as ProviderStatus);

  const businessType = params.get("business")?.trim() as
    | BusinessType
    | undefined;

  return providerService.getProviders({
    search,
    type,
    limits: { limit, offset, page },
    status,
    businessType,
  });
};

export const providerController = { getProvider };
