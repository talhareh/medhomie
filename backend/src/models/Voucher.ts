import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  description?: string;
  discountPercentage: number;
  applicableCourses: Types.ObjectId[];
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new Schema<IVoucher>({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, // Store in uppercase for consistency
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  applicableCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }],
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for case-insensitive code lookup
voucherSchema.index({ code: 1 }, { unique: true });
voucherSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
voucherSchema.index({ applicableCourses: 1 });

// Ensure validUntil is after validFrom
voucherSchema.pre('save', function(next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('validUntil must be after validFrom'));
  } else {
    next();
  }
});

export const Voucher = mongoose.model<IVoucher>('Voucher', voucherSchema);

