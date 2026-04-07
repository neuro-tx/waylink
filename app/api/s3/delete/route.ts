import { s3Client } from "@/lib/tigris";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (!key)
      return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const command = new DeleteObjectCommand({
      Bucket: process.env.TIGRIS_BUCKET_NAME!,
      Key: key,
    });

    await s3Client.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete object" },
      { status: 500 },
    );
  }
}
