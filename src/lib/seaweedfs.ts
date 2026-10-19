// src/lib/seaweedfs.ts  (S3-compatible client for SeaweedFS)
import { Client, S3Error } from "minio";

const bucket = process.env.SEAWEEDFS_BUCKET || "bucket";
const endpoint = process.env.SEAWEEDFS_ENDPOINT || "localhost";
const port = Number(process.env.SEAWEEDFS_PORT ?? "8333");
const useSSL = process.env.SEAWEEDFS_USE_SSL === "yes";
const accessKey = process.env.SEAWEEDFS_ACCESS_KEY;
const secretKey = process.env.SEAWEEDFS_SECRET_KEY;

export const seaweedfsClient = new Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey,
  secretKey,
  partSize: 8 * 1024 * 1024,
  // SeaweedFS S3 gateway does not use path-style by default,
  // but set it explicitly for compatibility.
  pathStyle: true,
});

// Upload a file to SeaweedFS (via S3-compatible API)
export const uploadFileToSeaweedFS = async (
  objectName: string,
  fileBuffer: Buffer
): Promise<string> => {
  try {
    await seaweedfsClient.putObject(bucket, objectName, fileBuffer);
    return `${endpoint}:${port}/${bucket}/${objectName}`;
  } catch (e: any) {
    console.log(`Error Uploading File to SeaweedFS: ${e}`);
    if (e instanceof S3Error) {
      console.log(`S3 Error: ${e}`);
    }
    throw e;
  }
};

export const generatePresignedUrl = async (
  objectName: string,
  expirySeconds: number = 3600 // 1 hour default
): Promise<string> => {
  try {
    const url = await seaweedfsClient.presignedGetObject(
      bucket,
      objectName,
      expirySeconds
    );
    return url;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw error;
  }
};

export const getFile = async (
  objectName: string
): Promise<NodeJS.ReadableStream> => {
  try {
    const readable = await seaweedfsClient.getObject(bucket, objectName);
    return readable;
  } catch (error) {
    console.error("Error fetching object from SeaweedFS:", error);
    throw error;
  }
};
