import api from '../utils/axios';
import { Course } from '../types/course';

export const courseService = {
  // Get all courses with enrollment counts
  getAllCourses: async (searchQuery?: string) => {
    const response = await api.get('/courses', {
      params: {
        search: searchQuery,
        includeEnrollmentCount: true
      }
    });
    return response.data;
  }
};
