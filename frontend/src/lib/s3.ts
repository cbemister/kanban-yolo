import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
});

const BUCKET = process.env.S3_BUCKET ?? "kanban-attachments";
const PUBLIC_URL = process.env.S3_PUBLIC_URL ?? "";

export async function getPresignedUploadUrl(key: string, mimeType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return url;
}

export function getPublicUrl(key: string): string {
  if (PUBLIC_URL) return `${PUBLIC_URL}/${key}`;
  return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}

export async function deleteS3Object(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
