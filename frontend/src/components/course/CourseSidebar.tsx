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
  openPDFInNewTab: (lesson: Lesson, attachmentIndex?: number) => void;
  onMobileClose?: () => void;
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
  openPDFInNewTab,
  onMobileClose
}) => {
  return (
    <div className="w-full h-full bg-gray-50 border-r border-gray-200 flex flex-col">
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
              onClick={() => toggleSection(section.id)}
              className="w-full px-3 md:px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 touch-manipulation"
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
                    key={lesson.id}
                    onClick={() => navigateToLesson(section.id, lesson.id)}
                    className={`w-full px-4 md:px-6 py-3 text-left border-b border-gray-100 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors touch-manipulation ${
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
                            <div 
                              className="text-xs text-purple-500 cursor-pointer hover:text-purple-700 p-1 -m-1 rounded touch-manipulation"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the parent button's onClick
                                navigateToQuiz(section.id, lesson.id);
                              }}
                            >
                              <FontAwesomeIcon icon={faQuestionCircle} className="mr-1 text-xs" />
                              <span>Quiz</span>
                            </div>
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
      </div>
    </div>
  );
};
