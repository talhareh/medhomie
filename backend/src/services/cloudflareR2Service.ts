import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';

// Cloudflare R2 is S3-compatible, so we use AWS SDK
class CloudflareR2Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    // Initialize S3 client with Cloudflare R2 endpoint
    this.s3 = new AWS.S3({
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      region: 'auto',
      signatureVersion: 'v4',
    });
    
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'medhome-pdfs';
  }

  /**
   * Upload PDF file to Cloudflare R2
   */
  async uploadPDF(file: Express.Multer.File, courseId: string, lessonId: string): Promise<{
    key: string;
    url: string;
    publicUrl: string;
  }> {
    try {
      // Generate a unique key for the PDF
      const fileExtension = path.extname(file.originalname);
      const timestamp = Date.now();
      const key = `pdfs/${courseId}/${lessonId}/${timestamp}-${file.originalname}`;

      console.log('📤 CloudflareR2Service: Uploading PDF:', {
        originalName: file.originalname,
        size: file.size,
        key,
        bucketName: this.bucketName
      });

      // Upload parameters
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: key,
        Body: fs.createReadStream(file.path),
        ContentType: 'application/pdf',
        ContentLength: file.size,
        Metadata: {
          'original-name': file.originalname,
          'course-id': courseId,
          'lesson-id': lessonId,
          'upload-timestamp': timestamp.toString()
        }
      };

      // Upload to R2
      const result = await this.s3.upload(uploadParams).promise();
      
      console.log('✅ CloudflareR2Service: Upload successful:', {
        location: result.Location,
        key: result.Key,
        etag: result.ETag
      });

      // Generate public URL using configured domain
      const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 'cdn.medhome.courses';
      const publicUrl = `https://${publicDomain}/${key}`;
      
      // Clean up local file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        key: result.Key!,
        url: result.Location!,
        publicUrl
      };

    } catch (error) {
      console.error('❌ CloudflareR2Service: Upload failed:', error);
      
      // Clean up local file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new Error(`Failed to upload PDF to Cloudflare R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a signed URL for private access
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      console.log('🔗 CloudflareR2Service: Generated signed URL for key:', key);
      
      return url;
    } catch (error) {
      console.error('❌ CloudflareR2Service: Failed to generate signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete PDF from R2
   */
  async deletePDF(key: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      console.log('🗑️ CloudflareR2Service: Deleted PDF:', key);
    } catch (error) {
      console.error('❌ CloudflareR2Service: Failed to delete PDF:', error);
      throw new Error(`Failed to delete PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if PDF exists in R2
   */
  async pdfExists(key: string): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get PDF metadata
   */
  async getPDFMetadata(key: string): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
    metadata: Record<string, string>;
  }> {
    try {
      const result = await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      return {
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        contentType: result.ContentType || 'application/pdf',
        metadata: result.Metadata || {}
      };
    } catch (error) {
      console.error('❌ CloudflareR2Service: Failed to get PDF metadata:', error);
      throw new Error(`Failed to get PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const cloudflareR2Service = new CloudflareR2Service();
export default cloudflareR2Service; 