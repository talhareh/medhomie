import api from '../utils/axios';
import { getAuthHeaders } from '../utils/authUtils';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags: string[];
  readTime: number;
}

// Get all blogs with optional filters
export const getBlogs = async (
  page = 1, 
  limit = 10, 
  status?: string, 
  tag?: string, 
  search?: string
): Promise<BlogListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (status) params.append('status', status);
  if (tag) params.append('tag', tag);
  if (search) params.append('search', search);
  
  const response = await api.get(`/blogs?${params.toString()}`);
  return response.data;
};

// Get a single blog by slug
export const getBlogBySlug = async (slug: string): Promise<BlogDetailResponse> => {
  const response = await api.get(`/blogs/${slug}`);
  return response.data;
};

// Admin functions
// Create a new blog
export const createBlog = async (blogData: BlogFormData): Promise<BlogDetailResponse> => {
  const response = await api.post(
    `/blogs`, 
    blogData, 
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Update a blog
export const updateBlog = async (id: string, blogData: Partial<BlogFormData>): Promise<BlogDetailResponse> => {
  const response = await api.put(
    `/blogs/${id}`, 
    blogData, 
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Delete a blog
export const deleteBlog = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/blogs/${id}`, 
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Upload blog image
export const uploadBlogImage = async (file: File): Promise<{ success: boolean; data: { url: string } }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post(
    `/blogs/upload-image`, 
    formData, 
    { 
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      } 
    }
  );
  return response.data;
};
