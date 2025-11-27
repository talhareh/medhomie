import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { ICourseDocument } from './Course';

export enum PayPalOrderStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface IPayPalOrder extends Document {
  paypalOrderId: string;
  student: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourseDocument;
  amount: number;
  currency: string;
  status: PayPalOrderStatus;
  approvalUrl?: string;
  payerId?: string;
  paymentId?: string;
  customId?: string;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payPalOrderSchema = new Schema<IPayPalOrder>({
  paypalOrderId: {
    type: String,
    required: true,
    unique: true
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
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: Object.values(PayPalOrderStatus),
    default: PayPalOrderStatus.CREATED
  },
  approvalUrl: {
    type: String
  },
  payerId: {
    type: String
  },
  paymentId: {
    type: String
  },
  customId: {
    type: String
  },
  invoiceId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
payPalOrderSchema.index({ paypalOrderId: 1 });
payPalOrderSchema.index({ student: 1, course: 1 });
payPalOrderSchema.index({ status: 1 });
payPalOrderSchema.index({ createdAt: -1 });

export const PayPalOrder = mongoose.model<IPayPalOrder>('PayPalOrder', payPalOrderSchema);
