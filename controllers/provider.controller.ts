import { providerService } from "@/services/provider.service";
import { NextRequest } from "next/server";

const getProvider = async (req: NextRequest) => {
  const url = req.url;
  return providerService.getProviders(url);
};

export const providerController = { getProvider };
