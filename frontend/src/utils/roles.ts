import { UserRole } from '../types/auth';

export const COURSE_MANAGER_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.INSTRUCTOR];

export function canManageCourses(role?: string): boolean {
  return role === UserRole.ADMIN || role === UserRole.INSTRUCTOR;
}

export function isAdmin(role?: string): boolean {
  return role === UserRole.ADMIN;
}
