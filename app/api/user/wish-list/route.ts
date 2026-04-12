import { tryCatch } from "@/lib/handler";
import { userController } from "@/controllers/user.controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(req ,async () => {
    const result = await userController.userWishList();
    return result;
  });
}
