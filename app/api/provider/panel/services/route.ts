import { getServicesController } from "@/controllers/providerBoard.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.url;
  return tryCatch(
    req,
    async () => {
      const res = await getServicesController(url);
      return res;
    },
    { role: "provider" },
  );
}
