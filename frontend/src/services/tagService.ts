import api from '../utils/axios';
import { Tag } from '../types/course';

export const getAllTags = async (): Promise<Tag[]> => {
  const response = await api.get<Tag[]>('/tags');
  return response.data;
};

export const getTagById = async (id: string): Promise<Tag> => {
  const response = await api.get<Tag>(`/tags/${id}`);
  return response.data;
};

export const createTag = async (tagData: Omit<Tag, '_id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<Tag> => {
  const response = await api.post<Tag>('/tags', tagData);
  return response.data;
};

export const updateTag = async (id: string, tagData: Partial<Omit<Tag, '_id' | 'slug' | 'createdAt' | 'updatedAt'>>): Promise<Tag> => {
  const response = await api.put<Tag>(`/tags/${id}`, tagData);
  return response.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await api.delete(`/tags/${id}`);
};
