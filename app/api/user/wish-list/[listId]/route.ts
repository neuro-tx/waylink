import { userController } from "@/controllers/user.controller";
import { tryCatch } from "@/lib/handler";

interface Props {
  params: Promise<{ listId: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { listId } = await params;

  if (!listId?.trim()) {
    return Response.json({ error: "list id is required" }, { status: 400 });
  }

  return tryCatch(() => userController.listItems(listId.trim()));
}
