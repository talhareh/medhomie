import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IHeroSliderData {
  title: string;
  altText: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

export interface IHeroSliderDocument extends IHeroSliderData, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const heroSliderSchema = new Schema<IHeroSliderDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  altText: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

heroSliderSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

export const HeroSlider = mongoose.model<IHeroSliderDocument>('HeroSlider', heroSliderSchema);
