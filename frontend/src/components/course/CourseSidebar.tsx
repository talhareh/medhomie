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
  faClock 
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
  navigateToLesson: (sectionId: string, lessonId: string) => void;
}

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
  navigateToLesson
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Course Content</h2>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span>{completedLessons}/{totalLessons} lessons completed</span>
          <span className="mx-2">•</span>
          <span>{totalHours}h total</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Course sections */}
      <div className="border-t border-gray-200">
        {sections.map(section => (
          <div key={section.id} className="bg-white">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={expandedSections[section.id] || section.expanded ? faChevronDown : faChevronRight} 
                  className="text-gray-500 mr-3"
                />
                <div className="text-left">
                  <h3 className="font-medium">{section.title}</h3>
                  <div className="text-xs text-gray-500 mt-1">
                    <span>{section.completedLessons}/{section.totalLessons} | {section.duration}</span>
                  </div>
                </div>
              </div>
            </button>
            
            {(expandedSections[section.id] || section.expanded) && (
              <div className="bg-gray-50">
                {section.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => navigateToLesson(section.id, lesson.id)}
                    className={`w-full px-4 py-3 flex items-center hover:bg-gray-100 ${
                      currentLessonId === lesson.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-8 flex-shrink-0">
                      {!hasAccess && !lesson.isPreview ? (
                        <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                      ) : lesson.completed ? (
                        <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                      ) : (
                        <FontAwesomeIcon 
                          icon={lesson.type === 'video' ? faPlay : faFile} 
                          className={lesson.isPreview ? 'text-primary' : 'text-gray-400'}
                        />
                      )}
                    </div>
                    <div className="flex-grow text-left">
                      <p className={`${lesson.completed ? 'text-green-500' : ''}`}>
                        {lesson.title}
                      </p>
                      <div className="flex space-x-2 mt-1">
                        {lesson.isPreview && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                            Preview
                          </span>
                        )}
                        {lesson.attachments && lesson.attachments.length > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                            <FontAwesomeIcon icon={faFile} className="mr-1" />
                            {lesson.attachments.length === 1 
                              ? lesson.attachments[0].filename // Show the filename for a single attachment
                              : `${lesson.attachments.length} Attachments` // Show count for multiple attachments
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      <span>{lesson.duration}</span>
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
