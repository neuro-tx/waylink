import { providerService } from "@/services/provider.service";
import { error } from "console";
import { NextRequest } from "next/server";

const getProvider = async (req: NextRequest) => {
  const url = req.url;
  return providerService.getProviders(url);
};

const providerStatus = async (providerId: string) => {
  if (!providerId) throw new Error("provider id not found");

  return await providerService.providerReviewState(providerId);
};

const getProviderById = async (id: string) => {
  if (!id) throw new Error("provider id not found");

  return await providerService.getProviderById(id);
};

const providerProducts = async(id:string ,limit:number ,showAll:boolean ,page:number) => {
  if (!id) throw new Error("provider id not found");

  return await providerService.getProviderProducts(id ,showAll ,limit ,page);
}

export const providerController = {
  getProvider,
  providerStatus,
  getProviderById,
  providerProducts,
};
