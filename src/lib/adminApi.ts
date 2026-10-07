
export interface StoredVideo {
  key: string;
  size: number;
  lastModified: string;
  lessonId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

function authHeader(secret: string) {
  return { Authorization: `Bearer ${secret}` };
}

export async function listVideos(secret: string): Promise<StoredVideo[]> {
  const res = await fetch("/api/videos/list", {
    headers: authHeader(secret),
  });
  if (!res.ok) throw new Error(await res.text());
  const { videos } = await res.json();
  return videos;
}

export async function deleteVideo(secret: string, lessonId: string): Promise<void> {
  const res = await fetch(`/api/videos/delete/${lessonId}`, {
    method: "DELETE",
    headers: authHeader(secret),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function uploadVideo(
  secret: string,
  lessonId: string,
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<{ key: string }> {
  const signRes = await fetch("/api/videos/upload", {
    method: "POST",
    headers: { ...authHeader(secret), "Content-Type": "application/json" },
    body: JSON.stringify({
      lessonId,
      contentType: file.type || "video/mp4",
      size: file.size,
    }),
  });
  if (!signRes.ok) throw new Error(await signRes.text());
  const { uploadUrl, key } = await signRes.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  return { key };
}

export async function uploadPdf(
  secret: string,
  courseId: string,
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<{ key: string }> {
  const signRes = await fetch("/api/pdfs/upload", {
    method: "POST",
    headers: { ...authHeader(secret), "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, filename: file.name, size: file.size }),
  });
  if (!signRes.ok) throw new Error(await signRes.text());
  const { uploadUrl, key } = await signRes.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ loaded: e.loaded, total: e.total, percent: Math.round((e.loaded / e.total) * 100) });
      }
    };
    xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });

  return { key };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
