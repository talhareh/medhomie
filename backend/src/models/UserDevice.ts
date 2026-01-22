import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserDevice extends Document {
    userId: Types.ObjectId;
    deviceFingerprint: string;
    deviceName: string;
    lastLogin: Date;
    isActive: boolean;
    isBlocked: boolean;
    ipAddress?: string;
    deviceInfo: {
        browser?: string;
        os?: string;
        platform?: string;
        userAgent?: string;
    };
}

const userDeviceSchema = new Schema<IUserDevice>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    deviceFingerprint: {
        type: String,
        required: true,
        index: true
    },
    deviceName: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    ipAddress: {
        type: String
    },
    deviceInfo: {
        browser: String,
        os: String,
        platform: String,
        userAgent: String
    }
}, {
    timestamps: true
});

// Compound index to ensure unique devices per user
userDeviceSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });

export const UserDevice = mongoose.model<IUserDevice>('UserDevice', userDeviceSchema);
