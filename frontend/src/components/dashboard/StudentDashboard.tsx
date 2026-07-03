import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBell,
  faBookOpen,
  faClipboardList,
  faDesktop,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faPlay,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import { getStoredResumeCourse } from '../../utils/resumeCourseStorage';

const severityStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
};

const severityIcon = {
  info: faInfoCircle,
  warning: faExclamationTriangle,
  danger: faExclamationCircle,
};

export const StudentDashboard: React.FC = () => {
  const { defaultResume, notices, warnings, pendingQuizzes, groupedDevices, courses, isLoading } =
    useStudentDashboard(true);

  const resume = useMemo(() => {
    const stored = getStoredResumeCourse();
    if (stored?.courseId) {
      const title =
        courses.find((c) => String(c._id) === String(stored.courseId))?.title || stored.courseTitle;
      return { courseId: stored.courseId, courseTitle: title };
    }
    return defaultResume;
  }, [courses, defaultResume]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-neutral-200 bg-white">
        <FontAwesomeIcon icon={faSpinner} className="text-2xl text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume */}
      {resume && (
        <div className="card border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">Continue learning</p>
              <h2 className="mt-1 text-xl font-bold text-neutral-900">{resume.courseTitle}</h2>
              <p className="mt-1 text-sm text-neutral-600">Pick up where you left off in the course player.</p>
            </div>
            <Link
              to={`/courses/${resume.courseId}/learn`}
              className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 min-h-[44px]"
            >
              <FontAwesomeIcon icon={faPlay} />
              Resume
              <FontAwesomeIcon icon={faArrowRight} className="text-xs opacity-90" />
            </Link>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Alerts</h3>
          {warnings.map((w) => (
            <div key={w.id} className={`rounded-lg border p-4 ${severityStyles[w.severity]}`}>
              {w.link ? (
                <Link to={w.link} className="flex gap-3 no-underline text-inherit">
                  <FontAwesomeIcon icon={severityIcon[w.severity]} className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">{w.message}</p>
                </Link>
              ) : (
                <div className="flex gap-3">
                  <FontAwesomeIcon icon={severityIcon[w.severity]} className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">{w.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notices */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faBell} className="text-primary" />
            <h3 className="text-lg font-semibold text-neutral-800">Course notices</h3>
          </div>
          {notices.length === 0 ? (
            <p className="text-sm text-neutral-500">No announcements from your courses right now.</p>
          ) : (
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1 text-sm">
              {notices.map((n, idx) => (
                <li
                  key={`${n.courseId}-${idx}`}
                  className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3"
                >
                  <p className="font-medium text-neutral-800">{n.courseTitle}</p>
                  <p className="mt-1 text-neutral-600">{n.text}</p>
                  <Link
                    to={`/courses/${n.courseId}`}
                    className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    View course
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Devices */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faDesktop} className="text-primary" />
            <h3 className="text-lg font-semibold text-neutral-800">Your devices</h3>
          </div>
          <p className="mb-3 text-sm text-neutral-600">
            Signed-in devices for your account (content access may be limited on unknown devices).
          </p>
          {groupedDevices.length === 0 ? (
            <p className="text-sm text-neutral-500">No device records loaded.</p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-neutral-700">
                {groupedDevices.length} registered device{groupedDevices.length !== 1 ? 's' : ''}
              </p>
              <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
                {groupedDevices.slice(0, 5).map((d) => (
                  <li
                    key={d.deviceName}
                    className="flex flex-col rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-neutral-800">{d.deviceName}</span>
                    {d.lastLogin && (
                      <span className="text-xs text-neutral-500">
                        Last active: {new Date(d.lastLogin).toLocaleString()}
                      </span>
                    )}
                    {d.isBlocked && (
                      <span className="text-xs font-medium text-red-600">Blocked</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Pending quizzes */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faClipboardList} className="text-primary" />
          <h3 className="text-lg font-semibold text-neutral-800">Quizzes awaiting you</h3>
        </div>
        {pendingQuizzes.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No open quizzes right now — or you&apos;ve already passed the ones available.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {pendingQuizzes.map((q) => (
              <li
                key={q.quizId}
                className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-neutral-900">{q.title}</p>
                  <p className="text-sm text-neutral-500">{q.courseTitle}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {q.attemptsRemaining} of {q.maxAttempts} attempt{q.maxAttempts !== 1 ? 's' : ''} left
                  </p>
                </div>
                <Link
                  to={`/student/quiz/${q.quizId}`}
                  className="inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-lg border border-primary bg-primary/10 px-4 text-sm font-semibold text-primary hover:bg-primary/15"
                >
                  Open quiz
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/student/quiz-attempts"
          className="inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          <FontAwesomeIcon icon={faClipboardList} />
          Quiz attempts
        </Link>
        <Link
          to="/student/courses"
          className="inline-flex min-h-[44px] touch-manipulation items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          <FontAwesomeIcon icon={faBookOpen} />
          All courses
        </Link>
        <Link
          to="/payments"
          className="inline-flex min-h-[44px] touch-manipulation items-center rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Payments
        </Link>
      </div>
    </div>
  );
};
