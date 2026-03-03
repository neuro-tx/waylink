import { transportService } from "@/services/transport.service";
import { NextRequest } from "next/server";

const feturedTransports = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;

  const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 12)));
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const offset = (page - 1) * limit;

  return await transportService.featuredTransports(limit, offset);
};

const getTransports = async(url: string) => {
  return await transportService.getTransportWithUrl(url);
}

export const transportController = { feturedTransports ,getTransports };
