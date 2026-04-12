import { userController } from "@/controllers/user.controller";
import { tryCatch } from "@/lib/handler";
import { NextRequest } from "next/server";

interface Props {
  params: Promise<{ listId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { listId } = await params;

  if (!listId?.trim()) {
    return Response.json({ error: "list id is required" }, { status: 400 });
  }

  return tryCatch(req, () => userController.listItems(listId.trim()));
}
