import { userController } from "@/controllers/user.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(req, async () => {
    return await userController.userProvider();
  });
}
