import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Records every watermarked PDF served to a user. The `token` value is embedded
 * (invisibly) into the PDF metadata, so a leaked file can be traced back to the
 * exact user, time, and source by looking the token up here.
 *
 * These records are intentionally NOT given a TTL — they are forensic evidence
 * and should persist.
 */
export interface IPdfDownloadLog extends Document {
  token: string;
  userId: Types.ObjectId;
  email: string;
  pdfUrl: string;
  courseId?: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pdfDownloadLogSchema = new Schema<IPdfDownloadLog>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

export const PdfDownloadLog = mongoose.model<IPdfDownloadLog>('PdfDownloadLog', pdfDownloadLogSchema);
