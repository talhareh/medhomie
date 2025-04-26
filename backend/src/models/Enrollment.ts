import mongoose, { Document, Schema } from 'mongoose';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IEnrollment extends Document {
  student: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  paymentReceipt: string;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  approvalDate?: Date;
  rejectionReason?: string;
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
  rejectionReason: String
}, {
  timestamps: true
});

// Ensure unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
