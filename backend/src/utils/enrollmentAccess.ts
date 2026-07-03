import { EnrollmentStatus } from '../models/Enrollment';

/** Student can access course content (lessons, quizzes, etc.) */
export function hasActiveEnrollmentAccess(enrollment: {
  status: EnrollmentStatus;
  isExpired?: boolean;
}): boolean {
  return (
    enrollment.status === EnrollmentStatus.APPROVED &&
    enrollment.isExpired !== true
  );
}

/** Row can be turned into an active enrollment again (admin bulk, self-service, payment). */
export function canReuseEnrollmentRow(enrollment: {
  status: EnrollmentStatus;
  isExpired?: boolean;
}): boolean {
  return !hasActiveEnrollmentAccess(enrollment);
}
