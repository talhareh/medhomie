// LessonContent.tsx - Component for displaying the content of a lesson
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faExclamationTriangle, faQuestionCircle, faVideo } from '@fortawesome/free-solid-svg-icons';
import { Lesson } from '../../types/courseTypes';
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';
import { QuizViewer } from './QuizViewer';

interface LessonContentProps {
  lesson: Lesson | null;
  videoErrors: Record<string, string>;
  preferredContentType?: 'video' | 'quiz' | null;
  onPreferredContentTypeHandled?: () => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  videoErrors,
  preferredContentType,
  onPreferredContentTypeHandled
}) => {
  const [activeContentType, setActiveContentType] = useState<'video' | 'quiz' | null>(null);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-gray-500 mb-4" />
          <p className="text-xl">No lesson selected</p>
          <p className="text-sm mt-2 text-gray-600">Please select a lesson from the course structure</p>
        </div>
      </div>
    );
  }

  // Determine what content types are available
  const hasVideo = lesson.type === 'video' && lesson.videoUrl;
  const hasQuiz = lesson.quiz;
  const isQuizLesson = lesson.type === 'quiz';
  

  // Auto-select content type if not set
  React.useEffect(() => {
    if (!activeContentType) {
      if (isQuizLesson) {
        setActiveContentType('quiz');
      } else if (hasVideo) {
        setActiveContentType('video');
      }
    }
  }, [lesson, activeContentType, isQuizLesson, hasVideo]);

  // Respond to preferred content type requests from parent
  React.useEffect(() => {
    if (preferredContentType && preferredContentType !== activeContentType) {
      setActiveContentType(preferredContentType);
      onPreferredContentTypeHandled?.();
    }
  }, [preferredContentType, activeContentType, onPreferredContentTypeHandled]);


  // Debug the rendering conditions (preserve existing debug log)
  console.log('LessonContent render conditions:', {
    hasLesson: !!lesson,
    lessonType: lesson.type,
    isVideo: lesson.type === 'video',
    hasQuiz: !!hasQuiz,
    isQuizLesson,
    activeContentType
  });

  // Handle content type switching
  const handleContentTypeChange = (type: 'video' | 'quiz') => {
    console.log('🔄 LessonContent: Switching content type to', type, {
      currentActiveContentType: activeContentType,
      hasVideo,
      hasQuiz
    });
    
    setActiveContentType(type);
  };

  // Determine what to show based on active content type
  const shouldShowVideo = activeContentType === 'video' && lesson.type === 'video';
  const shouldShowQuiz = activeContentType === 'quiz';
  
  // Debug display logic
  console.log('🎯 LessonContent: Display logic', {
    shouldShowVideo,
    shouldShowQuiz,
    activeContentType,
    isQuizLesson,
    hasVideo,
    hasQuiz,
    lessonType: lesson.type
  });

  return (
    <>
      {/* Lesson Header */}
      <div className="p-4 sm:p-6 pb-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-2xl font-bold truncate">{lesson.title}</div>
              
            </div>
            
          </div>
        </h2>
        

        {/* Content Type Tabs - Only show if lesson has multiple content types */}
        {(hasVideo && hasQuiz) ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {hasVideo && (
              <button
                onClick={() => handleContentTypeChange('video')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                  activeContentType === 'video'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FontAwesomeIcon icon={faVideo} className="mr-2" />
                Video
              </button>
            )}
            {hasQuiz && (
              <button
                onClick={() => handleContentTypeChange('quiz')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                  activeContentType === 'quiz'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                Quiz
              </button>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Content Area - Video and Quiz only */}
      <div className="px-4 md:px-6">
        {shouldShowVideo ? (
          <div className="mb-6">
            <UnifiedVideoPlayer 
              videoId={lesson.videoUrl || ''} 
              isLoading={false} 
              error={videoErrors[lesson.id]} 
              title={lesson.title} 
            />
          </div>
        ) : shouldShowQuiz && hasQuiz ? (
          <QuizViewer 
            quizId={lesson.quiz!}
            onComplete={(score, passed) => {
              // Handle quiz completion
              console.log('Quiz completed:', { score, passed });
              // You can add logic here to update lesson progress, show results, etc.
            }}
            onExit={() => {
              // Handle returning to lesson content
              if (hasVideo) {
                setActiveContentType('video');
              }
            }}
          />
        ) : null}
        
        {/* Lesson Content - Only show if not displaying quiz */}
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
