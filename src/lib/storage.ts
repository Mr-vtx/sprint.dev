
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.STORAGE_REGION ?? "auto",
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export const BUCKET = process.env.STORAGE_BUCKET!;

export function videoKey(lessonId: string) {
  return `videos/${lessonId}.mp4`;
}

export function pdfKey(courseId: string, filename: string) {
  return `pdfs/${courseId}/${filename}`;
}

export async function signedReadUrl(
  key: string,
  expiresIn = 3600,        
): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

export async function signedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 900,         
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export interface StoredFile {
  key: string;
  size: number;
  lastModified: Date;
  lessonId?: string;        
}

export async function listPrefix(prefix: string): Promise<StoredFile[]> {
  const res = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }),
  );
  return (res.Contents ?? [])
    .filter((o) => o.Key && o.Size !== undefined)
    .map((o) => {
      const key = o.Key!;
      const match = key.match(/^videos\/(.+)\.mp4$/);
      return {
        key,
        size: o.Size!,
        lastModified: o.LastModified!,
        lessonId: match?.[1],
      };
    });
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export function isAdminAuthed(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;                    
  const auth = req.headers.get("Authorization"); 
  return auth === `Bearer ${secret}`;
}
