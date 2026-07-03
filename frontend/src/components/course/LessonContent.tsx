// LessonContent.tsx - Component for displaying the content of a lesson
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faQuestionCircle, faVideo } from '@fortawesome/free-solid-svg-icons';
import { Lesson } from '../../types/courseTypes';
import { ResponsiveVideoPlayer } from './ResponsiveVideoPlayer';
import { QuizViewer } from './QuizViewer';

interface LessonContentProps {
  lesson: Lesson | null;
  videoErrors: Record<string, string>;
  preferredContentType?: 'video' | 'quiz' | null;
  onPreferredContentTypeHandled?: () => void;
  standaloneQuizId?: string | null;
  onExitStandaloneQuiz?: () => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  videoErrors,
  preferredContentType,
  onPreferredContentTypeHandled,
  standaloneQuizId,
  onExitStandaloneQuiz
}) => {
  const [activeContentType, setActiveContentType] = useState<'video' | 'quiz' | null>(null);

  useEffect(() => {
    setActiveContentType(null);
  }, [lesson?.id, standaloneQuizId]);

  const hasVideo = Boolean(lesson && lesson.type === 'video' && lesson.videoUrl);
  const hasQuiz = Boolean(lesson?.quiz);
  const isQuizLesson = lesson?.type === 'quiz';

  useEffect(() => {
    if (standaloneQuizId || !lesson) return;
    if (!activeContentType) {
      if (isQuizLesson) {
        setActiveContentType('quiz');
      } else if (hasVideo) {
        setActiveContentType('video');
      }
    }
  }, [lesson, standaloneQuizId, activeContentType, isQuizLesson, hasVideo]);

  useEffect(() => {
    if (standaloneQuizId || !lesson) return;
    if (preferredContentType && preferredContentType !== activeContentType) {
      setActiveContentType(preferredContentType);
      onPreferredContentTypeHandled?.();
    }
  }, [preferredContentType, activeContentType, onPreferredContentTypeHandled, lesson, standaloneQuizId]);

  const videoErrorMessage = lesson ? videoErrors[lesson.id] : null;

  if (standaloneQuizId) {
    return (
      <div className="flex-1 min-h-0">
        <QuizViewer quizId={standaloneQuizId} onComplete={() => {}} onExit={onExitStandaloneQuiz} />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full min-h-[40vh]">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-gray-500 mb-4" />
          <p className="text-xl">No lesson selected</p>
          <p className="text-sm mt-2 text-gray-600">Please select a lesson from the course structure</p>
        </div>
      </div>
    );
  }

  const handleContentTypeChange = (type: 'video' | 'quiz') => {
    setActiveContentType(type);
  };

  const shouldShowVideo = activeContentType === 'video' && lesson.type === 'video';
  const shouldShowQuiz = activeContentType === 'quiz';

  return (
    <>
      <div className="p-4 sm:p-6 pb-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-2xl font-bold truncate">{lesson.title}</div>
            </div>
          </div>
        </h2>

        {hasVideo && hasQuiz ? (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleContentTypeChange('video')}
              className={`inline-flex min-h-[44px] touch-manipulation items-center rounded-lg px-4 text-sm font-medium transition-colors sm:min-h-0 sm:py-2 ${
                activeContentType === 'video'
                  ? 'border-2 border-blue-300 bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faVideo} className="mr-2" />
              Video
            </button>
            <button
              type="button"
              onClick={() => handleContentTypeChange('quiz')}
              className={`inline-flex min-h-[44px] touch-manipulation items-center rounded-lg px-4 text-sm font-medium transition-colors sm:min-h-0 sm:py-2 ${
                activeContentType === 'quiz'
                  ? 'border-2 border-blue-300 bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
              Quiz
            </button>
          </div>
        ) : null}
      </div>

      <div className="px-4 md:px-6">
        {shouldShowVideo ? (
          <div className="mb-6 space-y-4">
            {videoErrorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {videoErrorMessage}
              </div>
            )}
            {lesson.videoUrl ? (
              <ResponsiveVideoPlayer
                key={lesson.videoUrl}
                src={lesson.videoUrl}
                title={lesson.title}
                className="shadow-2xl"
                onError={(message) => console.error('Lesson video playback error:', message)}
              />
            ) : (
              <div className="w-full bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-white text-center px-4">
                    <p className="text-lg md:text-xl mb-1">No video available</p>
                    <p className="text-sm text-gray-300">This lesson does not include a playable video file.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : shouldShowQuiz && hasQuiz ? (
          <QuizViewer
            quizId={lesson.quiz!}
            onComplete={() => {}}
            onExit={() => {
              if (hasVideo) {
                setActiveContentType('video');
              }
            }}
          />
        ) : null}

        {!shouldShowQuiz && (
          <div className="mt-6">
            <div className="prose max-w-none prose-sm md:prose-base">
              <p className="text-gray-700 leading-relaxed">{lesson.content || lesson.description}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
