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

// Retention window for login history (defaults to 365 days). Override with the
// LOGIN_HISTORY_TTL_DAYS env var; set it to 0 to disable automatic expiry.
const LOGIN_HISTORY_TTL_DAYS = Number(process.env.LOGIN_HISTORY_TTL_DAYS ?? 365);

// Index for querying recent login history
loginHistorySchema.index({ timestamp: -1 });
// Index for cleaning up old records (skipped when TTL is set to 0)
if (LOGIN_HISTORY_TTL_DAYS > 0) {
  loginHistorySchema.index(
    { timestamp: 1 },
    { expireAfterSeconds: LOGIN_HISTORY_TTL_DAYS * 24 * 60 * 60 }
  );
}

export const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', loginHistorySchema);
