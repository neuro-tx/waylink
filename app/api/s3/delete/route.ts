import { aj } from "@/lib/arcjet";
import { s3Client } from "@/lib/tigris";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const decision = await aj("admin").protect(req);
    if (decision.isDenied()) {
      let message = "Your request couldn’t be processed right now.";

      if (decision.reason?.isRateLimit?.()) {
        message =
          "You're sending requests too quickly. Please slow down and try again.";
      } else if (decision.reason?.isBot?.()) {
        message = "Automated access is not allowed. use the app normally.";
      } else if (decision.reason?.isShield?.()) {
        message =
          "This request looks unsafe and has been blocked for your protection.";
      }

      throw new Error(message);
    }

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
