import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import * as quizService from '../services/quizService';
const MAX_DEVICES = 3;

export interface DashboardWarning {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  link?: string;
}

export interface PendingQuizRow {
  quizId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  attemptsRemaining: number;
  maxAttempts: number;
}

export interface NoticeRow {
  courseId: string;
  courseTitle: string;
  text: string;
}

/** One row per distinct device name (matches admin grouping; duplicates collapse). */
export interface GroupedDeviceRow {
  deviceName: string;
  lastLogin?: string;
  isBlocked: boolean;
}

function groupDevicesByName(
  devices: Array<{ deviceName: string; lastLogin?: string; isBlocked?: boolean }>
): GroupedDeviceRow[] {
  const map = new Map<string, GroupedDeviceRow>();
  for (const d of devices) {
    const key = (d.deviceName || '').trim() || 'Unknown device';
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        deviceName: key,
        lastLogin: d.lastLogin,
        isBlocked: !!d.isBlocked,
      });
    } else {
      existing.isBlocked = existing.isBlocked || !!d.isBlocked;
      if (
        d.lastLogin &&
        (!existing.lastLogin || new Date(d.lastLogin) > new Date(existing.lastLogin))
      ) {
        existing.lastLogin = d.lastLogin;
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const ta = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
    const tb = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    return tb - ta;
  });
}

export function useStudentDashboard(enabled: boolean) {
  const { user } = useAuth();
  const userId = user?._id ?? (user as { id?: string } | null)?.id;

  const coursesQuery = useQuery({
    queryKey: ['public-courses', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/public/courses');
      return res.data as Array<{
        _id: string;
        title: string;
        enrollmentStatus?: string | null;
        isEnrolled?: boolean;
        noticeBoard?: string[];
      }>;
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });

  const profileQuery = useQuery({
    queryKey: ['user-profile-dashboard', userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data as {
        devices?: Array<{
          _id: string;
          deviceName: string;
          lastLogin?: string;
          isBlocked?: boolean;
        }>;
        payments?: Array<{
          status?: string;
          course?: { title?: string };
        }>;
      };
    },
    enabled: enabled && !!userId,
    staleTime: 60_000,
  });

  const courses = coursesQuery.data ?? [];

  const approvedCourseIds = useMemo(
    () =>
      courses
        .filter((c) => c.enrollmentStatus === 'approved' && c.isEnrolled)
        .map((c) => c._id),
    [courses]
  );

  const courseTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c._id, c.title));
    return m;
  }, [courses]);

  const quizzesQueries = useQueries({
    queries: approvedCourseIds.map((courseId) => ({
      queryKey: ['course-quizzes', 'dashboard', courseId],
      queryFn: () => quizService.getCourseQuizzes(courseId),
      enabled: approvedCourseIds.length > 0 && enabled,
      staleTime: 60_000,
    })),
  });

  const flatQuizzes = useMemo(() => {
    const rows: Array<{
      quizId: string;
      courseId: string;
      courseTitle: string;
      title: string;
    }> = [];
    approvedCourseIds.forEach((courseId, idx) => {
      const raw = quizzesQueries[idx]?.data as { data?: { quizzes?: Array<{ _id: string; title?: string; isActive?: boolean }> } } | undefined;
      const list = raw?.data?.quizzes ?? [];
      const ct = courseTitleMap.get(courseId) ?? 'Course';
      list.forEach((q) => {
        if (q?._id && q.isActive !== false) {
          rows.push({
            quizId: q._id,
            courseId,
            courseTitle: ct,
            title: q.title || 'Quiz',
          });
        }
      });
    });
    return rows;
  }, [approvedCourseIds, quizzesQueries, courseTitleMap]);

  const eligQueries = useQueries({
    queries: flatQuizzes.map((row) => ({
      queryKey: ['quiz-eligibility', 'dashboard', row.quizId],
      queryFn: () => quizService.checkQuizEligibility(row.quizId),
      enabled: flatQuizzes.length > 0 && enabled,
      staleTime: 30_000,
    })),
  });

  const pendingQuizzes: PendingQuizRow[] = useMemo(() => {
    return flatQuizzes
      .map((row, i) => {
        const d = eligQueries[i]?.data?.data;
        if (!d?.canTake) return null;
        return {
          ...row,
          attemptsRemaining: d.attemptsRemaining ?? 0,
          maxAttempts: d.maxAttempts ?? 0,
        };
      })
      .filter((x): x is PendingQuizRow => x != null);
  }, [flatQuizzes, eligQueries]);

  const defaultResume = useMemo(() => {
    const first = approvedCourseIds[0];
    if (!first) return null;
    return {
      courseId: first,
      courseTitle: courseTitleMap.get(first) || '',
    };
  }, [approvedCourseIds, courseTitleMap]);

  const notices: NoticeRow[] = useMemo(() => {
    const rows: NoticeRow[] = [];
    courses.forEach((c) => {
      if (c.enrollmentStatus !== 'approved') return;
      const board = c.noticeBoard;
      if (!Array.isArray(board)) return;
      board.forEach((text) => {
        const t = String(text).trim();
        if (t) rows.push({ courseId: c._id, courseTitle: c.title, text: t });
      });
    });
    return rows.slice(0, 15);
  }, [courses]);

  const devices = profileQuery.data?.devices ?? [];

  const groupedDevices = useMemo(() => groupDevicesByName(devices), [devices]);

  const warnings: DashboardWarning[] = useMemo(() => {
    const w: DashboardWarning[] = [];
    if (user && !user.emailVerified) {
      w.push({
        id: 'email',
        severity: 'warning',
        message: 'Please verify your email address to secure your account.',
      });
    }
    courses.forEach((c) => {
      if (c.enrollmentStatus === 'pending') {
        w.push({
          id: `enroll-pend-${c._id}`,
          severity: 'info',
          message: `Enrollment pending approval for "${c.title}".`,
          link: `/courses/${c._id}`,
        });
      }
      if (c.enrollmentStatus === 'rejected') {
        w.push({
          id: `enroll-rej-${c._id}`,
          severity: 'warning',
          message: `Enrollment was not approved for "${c.title}".`,
          link: `/courses/${c._id}`,
        });
      }
    });
    const payments = profileQuery.data?.payments;
    if (Array.isArray(payments)) {
      payments.forEach((p, i) => {
        const courseTitle = p.course?.title || 'a course';
        if (p.status === 'pending') {
          w.push({
            id: `pay-pend-${i}`,
            severity: 'warning',
            message: `Payment verification pending for ${courseTitle}.`,
            link: '/payments',
          });
        }
        if (p.status === 'rejected') {
          w.push({
            id: `pay-rej-${i}`,
            severity: 'danger',
            message: `Payment needs attention for ${courseTitle}.`,
            link: '/payments',
          });
        }
      });
    }
    const distinctDeviceGroups = groupedDevices.length;
    if (distinctDeviceGroups >= MAX_DEVICES) {
      w.push({
        id: 'devices-full',
        severity: 'warning',
        message: 'You have reached your account device limit.',
      });
    } else if (distinctDeviceGroups === MAX_DEVICES - 1) {
      w.push({
        id: 'devices-near',
        severity: 'info',
        message: 'You are close to your account device limit.',
      });
    }
    return w;
  }, [courses, user, profileQuery.data, groupedDevices]);

  const isLoading =
    coursesQuery.isLoading ||
    profileQuery.isLoading ||
    (approvedCourseIds.length > 0 && quizzesQueries.some((q) => q.isLoading)) ||
    (flatQuizzes.length > 0 && eligQueries.some((q) => q.isLoading));

  return {
    defaultResume,
    notices,
    warnings,
    pendingQuizzes,
    groupedDevices,
    courses,
    isLoading,
    refetchAll: () => {
      void coursesQuery.refetch();
      void profileQuery.refetch();
    },
  };
}
