import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: Types.ObjectId;
  timestamp: Date;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  deviceInfo: {
    browser?: string;
    os?: string;
    platform?: string;
  };
  userAgent: string;
}

const loginHistorySchema = new Schema<ILoginHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  deviceInfo: {
    browser: String,
    os: String,
    platform: String
  },
  userAgent: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for querying login history within the last week
loginHistorySchema.index({ timestamp: -1 });
// Index for cleaning up old records
loginHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', loginHistorySchema);
