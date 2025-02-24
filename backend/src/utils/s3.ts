import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { UploadedFile } from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'your-bucket-name';

export const uploadToS3 = async (file: UploadedFile, folder: string): Promise<string> => {
  try {
    const fileExtension = path.extname(file.name);
    const key = `${folder}/${uuidv4()}${fileExtension}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.data,
        ContentType: file.mimetype,
      },
    });

    await upload.done();
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    const key = fileUrl.split('.com/')[1];
    await s3Client.send({
      Bucket: BUCKET_NAME,
      Key: key,
    });
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};
