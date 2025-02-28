import api from '../utils/axios';
import { Category } from '../types/course';

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData: Omit<Category, '_id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
  const response = await api.post<Category>('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: Partial<Omit<Category, '_id' | 'slug' | 'createdAt' | 'updatedAt'>>): Promise<Category> => {
  const response = await api.put<Category>(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
