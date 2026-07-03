const STORAGE_KEY = 'medhome_resume_course';

export interface ResumeCoursePayload {
  courseId: string;
  courseTitle: string;
  updatedAt: number;
}

export function getStoredResumeCourse(): ResumeCoursePayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResumeCoursePayload;
    if (!parsed?.courseId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredResumeCourse(courseId: string, courseTitle: string): void {
  try {
    const payload: ResumeCoursePayload = {
      courseId,
      courseTitle,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}
