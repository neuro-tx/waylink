import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";
import { serve } from "inngest/next";

export const { GET, PUT, POST } = serve({
  client: inngest,
  functions,
});
