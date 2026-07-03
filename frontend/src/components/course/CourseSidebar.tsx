// CourseSidebar.tsx - Course structure sidebar component
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronRight, 
  faPlay, 
  faFile, 
  faLock, 
  faCheck, 
  faClock,
  faQuestionCircle,
  faTimes,
  faCloud
} from '@fortawesome/free-solid-svg-icons';
import { Section, Lesson } from '../../types/courseTypes';

interface CourseSidebarProps {
  sections: Section[];
  expandedSections: Record<string, boolean>;
  currentLessonId: string | null;
  hasAccess: boolean;
  completedLessons: number;
  totalLessons: number;
  totalHours: number;
  progressPercentage: number;
  toggleSection: (sectionId: string) => void;
  navigateToLesson: (
    sectionId: string,
    lessonId: string,
    options?: { contentType?: 'video' | 'quiz' }
  ) => void;
  navigateToQuiz?: (sectionId: string, lessonId: string) => void;
  navigateToCourseQuiz?: (quizId: string) => void;
  courseQuizzes?: any[];
  openPDFInNewTab: (lesson: Lesson, attachmentIndex?: number) => void;
  onMobileClose?: () => void;
  /** Highlights the active course-level quiz row when opened in the player */
  selectedCourseQuizId?: string | null;
}

// Helper function to get a readable name for the attachment
const getReadableAttachmentName = (type: string) => {
  return type || 'PDF Document';
};

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  sections,
  expandedSections,
  currentLessonId,
  hasAccess,
  completedLessons,
  totalLessons,
  totalHours,
  progressPercentage,
  toggleSection,
  navigateToLesson,
  navigateToQuiz,
  navigateToCourseQuiz,
  courseQuizzes = [],
  openPDFInNewTab,
  onMobileClose,
  selectedCourseQuizId = null
}) => {
  return (
    <div className="flex h-full w-full flex-col border-r border-gray-200 bg-gray-50 pb-[env(safe-area-inset-bottom)] md:pb-0">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">Course Content</h2>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 -mr-2"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          )}
        </div>
        
        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-1">
            <span>{completedLessons}/{totalLessons} lessons</span>
            <span>{totalHours}h total</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Course Structure */}
      <div className="flex-1 overflow-y-auto">
        {sections.map(section => (
          <div key={section.id} className="bg-white">
            {/* Section Header */}
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="min-h-[48px] w-full touch-manipulation border-b border-gray-100 px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none md:min-h-0 md:px-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <FontAwesomeIcon 
                    icon={expandedSections[section.id] ? faChevronDown : faChevronRight} 
                    className="mr-2 text-gray-400 text-sm flex-shrink-0"
                  />
                  <span className="font-medium text-gray-800 text-sm md:text-base truncate">{section.title}</span>
                </div>
                <span className="text-xs md:text-sm text-gray-500 ml-2 flex-shrink-0">
                  {section.completedLessons}/{section.lessons.length}
                </span>
              </div>
            </button>

            {/* Section Lessons */}
            {expandedSections[section.id] && (
              <div className="bg-gray-50">
                {section.lessons.map(lesson => (
                  <button
                    type="button"
                    key={lesson.id}
                    onClick={() => navigateToLesson(section.id, lesson.id)}
                    className={`min-h-[52px] w-full touch-manipulation border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none md:min-h-0 md:px-6 ${
                      currentLessonId === lesson.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          {lesson.completed ? (
                            <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2 text-sm flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-gray-300 rounded-full mr-2 flex-shrink-0"></div>
                          )}
                          <span className={`text-xs md:text-sm font-medium truncate ${lesson.completed ? 'text-green-700' : 'text-gray-800'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        
                        <div className="ml-4 md:ml-6 mt-1 space-y-1">
                          {/* Show video link if video is available */}
                          {lesson.videoUrl && (
                            <div className="text-xs text-blue-500">
                              <FontAwesomeIcon icon={faPlay} className="mr-1 text-xs" />
                              <span>Video</span>
                            </div>
                          )}
                          
                          {/* Show PDF link if pdfUrl is available */}
                          {(lesson.pdfUrl || (lesson.attachments && lesson.attachments.length > 0)) && (
                            <div className="text-xs text-gray-500">
                              <div 
                                className="cursor-pointer hover:text-primary mb-1 p-1 -m-1 rounded touch-manipulation"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the parent button's onClick
                                  // Open PDF directly in new tab
                                  openPDFInNewTab(lesson, 0);
                                }}
                              >
                                <FontAwesomeIcon icon={faFile} className="mr-1 text-xs" />
                                <span className="truncate">
                                  {lesson.ebookName || (lesson.attachments && lesson.attachments[0]?.filename) || 'PDF'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Show Quiz link if quiz is available */}
                          {lesson.quiz && navigateToQuiz && (
                            <button
                              type="button"
                              className="-m-1 flex min-h-[44px] w-full touch-manipulation items-center rounded-lg px-1 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 active:bg-purple-100 sm:min-h-0 sm:py-1 sm:text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToQuiz(section.id, lesson.id);
                              }}
                            >
                              <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 shrink-0 text-xs sm:mr-1" />
                              <span>Quiz</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Course-Level Quizzes Section */}
        {courseQuizzes && courseQuizzes.length > 0 && (
          <div className="bg-white border-t-2 border-gray-200">
            <div className="px-3 md:px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800 text-sm md:text-base">Course Quizzes</h3>
            </div>
            <div className="bg-gray-50">
              {courseQuizzes.map((quiz) => (
                <button
                  key={quiz._id || quiz.id}
                  type="button"
                  onClick={() => navigateToCourseQuiz && navigateToCourseQuiz(quiz._id || quiz.id)}
                  className={`min-h-[48px] w-full touch-manipulation border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none md:min-h-0 md:px-6 ${
                    selectedCourseQuizId &&
                    (quiz._id === selectedCourseQuizId || quiz.id === selectedCourseQuizId)
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-purple-500 mr-2 text-sm flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-gray-800 truncate">
                      {quiz.title}
                    </span>
                  </div>
                  {quiz.description && (
                    <p className="text-xs text-gray-500 mt-1 ml-6 truncate">{quiz.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
