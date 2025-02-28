import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  // For hierarchical categories if needed
  parent?: mongoose.Types.ObjectId | ICategory;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);
