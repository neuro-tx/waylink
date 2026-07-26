import { dashboardData } from "@/controllers/admin-aggs.controller";
import { tryCatch } from "@/lib/handler";
import { DateRange } from "@/lib/panel-types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") ?? "90d") as DateRange;

  return tryCatch(
    req,
    async () => {
      return await dashboardData(period);
    },
    {
      role: "admin",
    },
  );
}
