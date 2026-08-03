import { getDashboardInsights } from "@/controllers/admin-aggs.controller";
import { tryCatch } from "@/lib/handler";
import { DateRange } from "@/lib/panel-types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") as DateRange | undefined;

  return tryCatch(
    req,
    async () => {
      const res = await getDashboardInsights(period);
      console.log(res);
      return res;
    },
    {
      role: "admin",
    },
  );
}
