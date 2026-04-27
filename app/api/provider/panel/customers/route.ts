import { getCustomersController } from "@/controllers/customers.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(
    req,
    async () => {
      return await getCustomersController(req);
    },
    { role: "provider" },
  );
}
