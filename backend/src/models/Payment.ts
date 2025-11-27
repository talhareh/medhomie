import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { ICourseDocument } from './Course';
import { IEnrollment } from './Enrollment';

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

export interface IPaymentHistory {
  status: PaymentStatus;
  updatedBy: Types.ObjectId;
  updatedAt: Date;
  reason?: string;
}

export interface IPayment extends Document {
  enrollment: Types.ObjectId | IEnrollment;
  student: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourseDocument;
  amount: number;
  originalAmount?: number; // Original price before voucher discount
  discountAmount?: number; // Discount amount from voucher
  voucher?: Types.ObjectId; // Reference to voucher if used
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  bankName?: string;
  accountHolderNumber?: string;
  transactionId?: string;
  receiptPath: string;
  status: PaymentStatus;
  statusHistory: IPaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentHistorySchema = new Schema<IPaymentHistory>({
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  reason: String
});

const paymentSchema = new Schema<IPayment>({
  enrollment: {
    type: Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    min: 0
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  voucher: {
    type: Schema.Types.ObjectId,
    ref: 'Voucher'
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  bankName: String,
  accountHolderNumber: String,
  transactionId: String,
  receiptPath: {
    type: String,
    required: function() {
      return this.paymentMethod !== PaymentMethod.PAYPAL;
    }
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  statusHistory: [paymentHistorySchema]
}, {
  timestamps: true
});

// Indexes for efficient querying
paymentSchema.index({ student: 1, course: 1 });
paymentSchema.index({ course: 1, status: 1 });
paymentSchema.index({ student: 1, status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
