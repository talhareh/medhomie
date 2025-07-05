// LessonContent.tsx - Component for displaying the content of a lesson
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faClock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Lesson } from '../../types/courseTypes';
import { PDFViewer } from './PDFViewer';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface LessonContentProps {
  lesson: Lesson | null;
  videoBlobs: Record<string, string>;
  videoLoading: Record<string, boolean>;
  videoErrors: Record<string, string>;
  selectedAttachment: {index: number, url: string, filename?: string} | null;
  handleAttachmentClick: (index: number) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  videoBlobs,
  videoLoading,
  videoErrors,
  selectedAttachment,
  handleAttachmentClick
}) => {
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

  // Debug the rendering conditions
  console.log('LessonContent render conditions:', {
    hasLesson: !!lesson,
    lessonType: lesson.type,
    isVideo: lesson.type === 'video',
    hasAttachment: !!selectedAttachment,
    shouldShowVideo: !selectedAttachment && lesson.type === 'video'
  });

  return (
    <>
      {/* Lesson Header */}
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
        
        
        
      </div>
      
      {/* PDF Viewer or Video Player */}
      {selectedAttachment ? (
        <>
          {console.log('PDF RENDER - Using attachment URL:', selectedAttachment.url)}
          <PDFViewer 
            src={selectedAttachment.url} 
            title={selectedAttachment.filename || 
                  (lesson.attachments?.[selectedAttachment.index]?.filename) || 
                  (typeof lesson.attachments?.[selectedAttachment.index] === 'string' ? 
                    lesson.attachments?.[selectedAttachment.index]?.split('/').pop() : 
                    `Attachment ${selectedAttachment.index + 1}`)} 
          />
        </>
      ) : lesson.type === 'video' ? (
        <>
          {console.log('VIDEO PLAYER RENDER - Lesson:', lesson.id, 'Type:', lesson.type)}
          {console.log('VIDEO PLAYER PROPS:', {
            src: videoBlobs[lesson.id] || '',
            hasBlob: !!videoBlobs[lesson.id],
            isLoading: videoLoading[lesson.id],
            hasError: !!videoErrors[lesson.id],
            error: videoErrors[lesson.id]
          })}
          <CustomVideoPlayer 
            src={videoBlobs[lesson.id] || ''} 
            isLoading={videoLoading[lesson.id]} 
            error={videoErrors[lesson.id]} 
            title={lesson.title} 
          />
        </>
      ) : null}
      
      {/* Lesson Content */}
      <div className="p-6 pt-4">
        <div className="prose max-w-none">
          <p>{lesson.content || lesson.description}</p>
        </div>
      </div>
    </>
  );
};
