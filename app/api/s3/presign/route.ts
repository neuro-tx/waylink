import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/tigris";
import { aj } from "@/lib/arcjet";

export async function POST(request: NextRequest) {
  try {
    const decision = await aj("admin").protect(request);
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

    const { key, contentType } = await request.json();

    if (!key || !contentType)
      return NextResponse.json(
        { error: "Missing key or contentType" },
        { status: 400 },
      );

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 200,
    });

    return NextResponse.json({ presignedUrl, key });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 },
    );
  }
}
