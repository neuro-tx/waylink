import { transportController } from "@/controllers/transport.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(req ,async () => {
    return await transportController.feturedTransports(req);
  });
}
