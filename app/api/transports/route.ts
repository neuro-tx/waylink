import { transportController } from "@/controllers/transport.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.url;
  
  return tryCatch(async () => {
    const data = await transportController.getTransports(url);
    return data
  });
}
