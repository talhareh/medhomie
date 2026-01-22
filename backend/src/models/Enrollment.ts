import mongoose, { Document, Schema } from 'mongoose';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IEnrollment extends Document {
  student: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  paymentReceipt?: string;
  paymentMethod?: string;
  paymentDetails?: Record<string, any>;
  voucherCode?: string; // Voucher code used (for reference)
  status: EnrollmentStatus;
  enrollmentDate: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  expirationDate: Date;
  isExpired: boolean;
}

const enrollmentSchema = new Schema<IEnrollment>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  paymentReceipt: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    required: false
  },
  paymentDetails: {
    type: Schema.Types.Mixed,
    required: false
  },
  voucherCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: Object.values(EnrollmentStatus),
    default: EnrollmentStatus.PENDING
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  rejectionReason: String,
  expirationDate: {
    type: Date,
    required: false // Optional for backward compatibility, but required for new enrollments
  },
  isExpired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
// Index for efficient cron job queries
enrollmentSchema.index({ expirationDate: 1, status: 1, isExpired: 1 });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
