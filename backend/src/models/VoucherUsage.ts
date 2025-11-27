import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVoucherUsage extends Document {
  voucher: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  enrollment: Types.ObjectId;
  payment?: Types.ObjectId;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  usedAt: Date;
  appliedBy: Types.ObjectId; // Admin if retroactive, or student
  createdAt: Date;
  updatedAt: Date;
}

const voucherUsageSchema = new Schema<IVoucherUsage>({
  voucher: {
    type: Schema.Types.ObjectId,
    ref: 'Voucher',
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
  enrollment: {
    type: Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  payment: {
    type: Schema.Types.ObjectId,
    ref: 'Payment'
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  appliedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
voucherUsageSchema.index({ voucher: 1, student: 1 }); // Prevent duplicate usage
voucherUsageSchema.index({ student: 1 });
voucherUsageSchema.index({ voucher: 1 });
voucherUsageSchema.index({ course: 1 });
voucherUsageSchema.index({ enrollment: 1 });

// Ensure one voucher can only be used once per student
voucherUsageSchema.index({ voucher: 1, student: 1 }, { unique: true });

export const VoucherUsage = mongoose.model<IVoucherUsage>('VoucherUsage', voucherUsageSchema);

