import "server-only";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MenuInputError } from "@/lib/menu-management";

const bucket = "restaurant-menu-images";
const managedKey = /^menu\/[0-9a-f-]{36}\.(jpg|png|webp)$/;
const maxBytes = 3 * 1024 * 1024;

function storageClient() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, AWS_REGION } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_ENDPOINT_URL_S3 || !AWS_REGION) {
    throw new Error("Menu image storage is not configured.");
  }
  return new S3Client({
    region: AWS_REGION, endpoint: AWS_ENDPOINT_URL_S3, forcePathStyle: true,
    credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
  });
}

export function menuImageUrl(value: string | null): string | null {
  if (!value) return null;
  if (managedKey.test(value)) {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3;
    return endpoint ? endpoint.replace(/\/$/, "") + "/" + bucket + "/" + value : null;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? value : null;
  } catch { return null; }
}

export async function uploadMenuImage(file: File): Promise<string> {
  if (file.size > maxBytes) throw new MenuInputError("รูปต้องมีขนาดไม่เกิน 3 MB");
  const bytes = Buffer.from(await file.arrayBuffer());
  let extension: string;
  let contentType: string;
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.toString("ascii", 12, 16) === "IHDR") {
    extension = "png"; contentType = "image/png";
  } else if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    extension = "jpg"; contentType = "image/jpeg";
  } else if (bytes.length >= 16 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    extension = "webp"; contentType = "image/webp";
  } else { throw new MenuInputError("รองรับไฟล์ภาพ JPG, PNG และ WebP เท่านั้น"); }
  const key = "menu/" + randomUUID() + "." + extension;
  await storageClient().send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: bytes, ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return key;
}

export async function deleteMenuImage(key: string | null) {
  if (!key || !managedKey.test(key)) return;
  await storageClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
