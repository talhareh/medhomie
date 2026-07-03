import api from '../utils/axios';

export const enrollmentService = {
  // Bulk enroll students in a course
  bulkEnrollStudents: async (courseId: string, studentIds: string[], expirationDate: string) => {
    const response = await api.post(`/enrollments/courses/${courseId}/bulk-enroll`, {
      studentIds,
      expirationDate
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
        search: searchQuery,
        excludeWithdrawn: true
      }
    });

    const enrollments = Array.isArray(response.data) ? response.data : [];

    // Skip rows where student ref is missing (e.g. deleted user). Reading
    // enrollment.student._id on null throws and the modal shows no rows.
    return enrollments
      .filter((enrollment: { student?: unknown }) => enrollment.student != null)
      .map((enrollment: any) => ({
        _id: enrollment.student._id,
        fullName: enrollment.student.fullName,
        email: enrollment.student.email,
        whatsappNumber: enrollment.student.whatsappNumber
      }));
  },

  // Update enrollment expiration date
  updateEnrollmentExpiration: async (enrollmentId: string, expirationDate: string) => {
    const response = await api.patch(`/enrollments/${enrollmentId}/expiration`, {
      expirationDate
    });
    return response.data;
  },

  // Bulk update enrollment expiration dates
  bulkUpdateExpiration: async (enrollmentIds: string[], expirationDate: string) => {
    const response = await api.patch(`/enrollments/bulk-expiration`, {
      enrollmentIds,
      expirationDate
    });
    return response.data;
  }
};
