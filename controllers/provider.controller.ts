import { providerService } from "@/services/provider.service";
import { NextRequest } from "next/server";

const getProvider = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const type = params.get("type") as
    | "transport"
    | "accommodation"
    | "experience";

  return providerService.getProviders(search, type);
};

export const providerController = { getProvider };
