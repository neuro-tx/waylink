import { experiencesController } from "@/controllers/experince.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return tryCatch(req, async () => {
    const url = req.url;
    return await experiencesController.getExperiences(url);
  });
}
