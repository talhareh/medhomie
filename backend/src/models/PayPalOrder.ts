import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { ICourseDocument } from './Course';

export enum CheckoutOrderStatus {
  CREATED = 'CREATED',
  REDIRECTED = 'REDIRECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface ICheckoutOrder extends Document {
  gatewayOrderId: string;
  gateway: 'kuickpay';
  student: Types.ObjectId | IUser;
  course: Types.ObjectId | ICourseDocument;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  voucherCode?: string;
  currency: string;
  exchangeRate?: number;
  exchangeRateDate?: Date;
  pkrAmount?: number;
  pkrCurrency?: string;
  status: CheckoutOrderStatus;
  checkoutUrl?: string;
  gatewayTransactionId?: string;
  responseCode?: string;
  signature?: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const checkoutOrderSchema = new Schema<ICheckoutOrder>({
  gatewayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  gateway: {
    type: String,
    enum: ['kuickpay'],
    default: 'kuickpay'
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
  voucherCode: {
    type: String
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  exchangeRateDate: {
    type: Date
  },
  pkrAmount: {
    type: Number,
    min: 0
  },
  pkrCurrency: {
    type: String,
    default: 'PKR'
  },
  status: {
    type: String,
    enum: Object.values(CheckoutOrderStatus),
    default: CheckoutOrderStatus.CREATED
  },
  checkoutUrl: {
    type: String
  },
  gatewayTransactionId: {
    type: String
  },
  responseCode: {
    type: String
  },
  signature: {
    type: String
  },
  requestPayload: {
    type: Schema.Types.Mixed
  },
  responsePayload: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

checkoutOrderSchema.index({ gatewayOrderId: 1 });
checkoutOrderSchema.index({ student: 1, course: 1 });
checkoutOrderSchema.index({ status: 1 });
checkoutOrderSchema.index({ createdAt: -1 });

export const CheckoutOrder = mongoose.model<ICheckoutOrder>('CheckoutOrder', checkoutOrderSchema);
