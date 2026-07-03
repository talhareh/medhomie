import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/axios';
import * as quizService from '../../services/quizService';

/**
 * Legacy /student/quiz/:quizId URLs redirect into the course player with the quiz loaded.
 */
export const QuizToLearnRedirect: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const didNavigate = useRef(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quiz-redirect', quizId],
    queryFn: () => quizService.getQuiz(quizId!),
    enabled: !!quizId,
    retry: 1,
  });

  useEffect(() => {
    if (!quizId || isLoading || didNavigate.current) return;
    if (isError || !data?.data) return;

    const quiz = data.data;
    const courseRaw = quiz.course as string | { _id?: string };
    const courseId =
      typeof courseRaw === 'string' ? courseRaw : courseRaw?._id ?? null;
    if (!courseId) return;

    const lessonRaw = quiz.lesson as string | { _id?: string } | undefined;
    const lessonId =
      lessonRaw == null
        ? null
        : typeof lessonRaw === 'string'
          ? lessonRaw
          : lessonRaw._id ?? null;

    const goCourseQuiz = () => {
      didNavigate.current = true;
      navigate(
        {
          pathname: `/courses/${courseId}/learn`,
          search: `?courseQuiz=${encodeURIComponent(quizId)}`,
        },
        { replace: true, state: { courseQuizId: quizId } }
      );
    };

    if (!lessonId) {
      goCourseQuiz();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/public/courses/${courseId}`);
        if (cancelled) return;
        const modules = res.data?.modules || [];
        let moduleId: string | null = null;
        for (const m of modules) {
          if (m.lessons?.some((l: { _id: string }) => l._id === lessonId)) {
            moduleId = m._id;
            break;
          }
        }
        if (cancelled) return;
        didNavigate.current = true;
        if (!moduleId) {
          goCourseQuiz();
          return;
        }
        navigate(`/courses/${courseId}/learn/${moduleId}/${lessonId}`, {
          replace: true,
          state: {
            moduleId,
            lessonId,
            contentType: 'quiz' as const,
          },
        });
      } catch {
        if (!cancelled) {
          didNavigate.current = true;
          goCourseQuiz();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quizId, data, isLoading, isError, navigate]);

  if (isError) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <p className="text-red-700">
          {(error as Error)?.message || 'Could not load this quiz.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
};
