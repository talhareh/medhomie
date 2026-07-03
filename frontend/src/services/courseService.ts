import api from '../utils/axios';
import { Course } from '../types/course';

export const courseService = {
  // Get all courses with enrollment counts
  getAllCourses: async (searchQuery?: string) => {
    const params: Record<string, string | boolean> = {
      includeEnrollmentCount: true,
    };
    if (searchQuery?.trim()) {
      params.search = searchQuery.trim();
    }
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get a single course by ID
  getCourse: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  }
};
