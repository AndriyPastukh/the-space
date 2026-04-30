import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME!;
  }

  async generatePresignedUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Returns a presigned URL that allows the client to PUT a file directly to S3
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Failed to delete S3 object: ${key}`, error);
    }
  }

  extractKeyFromUrl(url: string): string | null {
    if (!url || url.includes('dicebear.com')) return null;
    try {
      const urlObj = new URL(url);
      // Support both path-style and virtual-hosted style URLs
      // Virtual-hosted: https://bucket-name.s3.region.amazonaws.com/key
      // Path-style: https://s3.region.amazonaws.com/bucket-name/key
      const pathname = urlObj.pathname;
      if (pathname.startsWith(`/${this.bucketName}/`)) {
        return pathname.substring(this.bucketName.length + 2);
      }
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (e) {
      return null;
    }
  }
}
