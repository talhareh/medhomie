import mongoose, { Document, Schema, Types } from 'mongoose';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface IBlogData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: Types.ObjectId | string;
  status: BlogStatus;
  tags: string[];
  readTime: number;
}

export interface IBlogDocument extends IBlogData, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlogDocument>({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: { 
    type: String, 
    required: true 
  },
  excerpt: { 
    type: String, 
    required: true 
  },
  featuredImage: { 
    type: String 
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: { 
    type: String, 
    enum: Object.values(BlogStatus),
    default: BlogStatus.DRAFT,
    required: true 
  },
  tags: [{ 
    type: String 
  }],
  readTime: { 
    type: Number, 
    default: 5 
  }
}, {
  timestamps: true
});

// Create text index for search functionality
blogSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  tags: 'text'
});

export const Blog = mongoose.model<IBlogDocument>('Blog', blogSchema);
