import api from '../utils/axios';

export const enrollmentService = {
  // Bulk enroll students in a course
  bulkEnrollStudents: async (courseId: string, studentIds: string[]) => {
    const response = await api.post(`/enrollments/courses/${courseId}/bulk-enroll`, {
      studentIds
    });
    return response.data;
  },

  // Bulk remove students from a course
  bulkRemoveStudents: async (courseId: string, studentIds: string[]) => {
    const response = await api.post(`/enrollments/courses/${courseId}/bulk-remove`, {
      studentIds
    });
    return response.data;
  },

  // Get all students available for enrollment
  getAvailableStudents: async (courseId: string, searchQuery?: string) => {
    const response = await api.get(`/users/students`, {
      params: {
        courseId,
        search: searchQuery
      }
    });
    return response.data;
  },

  // Get enrolled students in a course
  getEnrolledStudents: async (courseId: string, searchQuery?: string) => {
    const response = await api.get(`/enrollments`, {
      params: {
        courseId,
        search: searchQuery
      }
    });
    
    // Check if the response is already in the expected format
    if (response.data.length > 0 && !response.data[0].student) {
      // If data is already in the correct format (direct student objects)
      return response.data;
    }
    
    // Extract student data from enrollments
    return response.data.map((enrollment: any) => ({
      _id: enrollment.student._id,
      fullName: enrollment.student.fullName,
      email: enrollment.student.email,
      whatsappNumber: enrollment.student.whatsappNumber
    }));
  }
};
