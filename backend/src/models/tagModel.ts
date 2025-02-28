import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

// Create slug from name before saving
tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

export default mongoose.model<ITag>('Tag', tagSchema);
