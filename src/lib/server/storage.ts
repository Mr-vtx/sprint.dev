import "server-only";
import {
  S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { courses } from "@/lib/data";

export function storageConfigured(): boolean {
  return Boolean(
    process.env.STORAGE_ENDPOINT && process.env.STORAGE_BUCKET &&
    process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY,
  );
}

let client: S3Client | null = null;
function s3(): S3Client {
  return (client ??= new S3Client({
    region: process.env.STORAGE_REGION ?? "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  }));
}
const Bucket = () => process.env.STORAGE_BUCKET!;

/** Only ids that exist in data.ts may be used as storage keys. */
export const isLessonId = (id: string) => courses.some((c) => c.lessons.some((l) => l.id === id));
export const isCourseId = (id: string) => courses.some((c) => c.id === id);
export const isPdfName = (f: string) => f.length <= 120 && /^[\w\-. ]+\.pdf$/i.test(f) && !f.includes("..");

export const videoKey = (lessonId: string) => `videos/${lessonId}.mp4`;
export const pdfKey = (courseId: string, filename: string) => `pdfs/${courseId}/${filename}`;

export const signedReadUrl = (key: string, expiresIn = 3600) =>
  getSignedUrl(s3(), new GetObjectCommand({ Bucket: Bucket(), Key: key }), { expiresIn });

/** ContentLength is signed into the URL, so the client can't upload more than it declared. */
export const signedUploadUrl = (key: string, contentType: string, size: number, expiresIn = 900) =>
  getSignedUrl(s3(), new PutObjectCommand({ Bucket: Bucket(), Key: key, ContentType: contentType, ContentLength: size }), { expiresIn });

export const deleteObject = (key: string) => s3().send(new DeleteObjectCommand({ Bucket: Bucket(), Key: key }));

export async function objectExists(key: string): Promise<boolean> {
  try { await s3().send(new HeadObjectCommand({ Bucket: Bucket(), Key: key })); return true; } catch { return false; }
}

export interface StoredFile { key: string; size: number; lastModified: string }

export async function listPrefix(prefix: string): Promise<StoredFile[]> {
  const res = await s3().send(new ListObjectsV2Command({ Bucket: Bucket(), Prefix: prefix }));
  return (res.Contents ?? [])
    .filter((o) => o.Key && o.Size !== undefined)
    .map((o) => ({ key: o.Key!, size: o.Size!, lastModified: (o.LastModified ?? new Date(0)).toISOString() }));
}
