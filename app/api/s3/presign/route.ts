import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/tigris";

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({ presignedUrl ,key });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 },
    );
  }
}
