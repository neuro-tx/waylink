import { userController } from "@/controllers/user.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  return tryCatch(async () => {
    return await userController.userProvider();
  });
}
