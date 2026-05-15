import { db } from "@/db";
import { setupProgress } from "@/db/schemas";
import { eq } from "drizzle-orm";

export async function getServiceSetup(id: string) {
  try {
    const [res] = await db
      .select()
      .from(setupProgress)
      .where(eq(setupProgress.productId, id))
      .limit(1);
    return res;
  } catch {
    return null;
  }
}
