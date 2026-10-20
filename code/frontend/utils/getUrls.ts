const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MINIO_BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET || "bucket";

export const getDownloadUrl = (filePath: string) => {
  return `${API_BASE_URL}/${MINIO_BUCKET}/${filePath}`;
};
