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
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          <span>{lesson.duration}</span>
        </div>
        
        <div className="prose max-w-none">
          <p>{lesson.content || lesson.description}</p>
        </div>
        
        {/* Attachments Section */}
        {lesson.attachments && lesson.attachments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Attachments</h3>
            <div className="space-y-3">
              {lesson.attachments.map((attachment, index) => {
                return (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${selectedAttachment?.index === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => handleAttachmentClick(index)}
                  >
                    <div className="flex-grow flex items-center">
                      <FontAwesomeIcon icon={faFile} className="text-blue-500 mr-3 text-xl" />
                      <div className="flex-grow">
                        <p className="font-medium">{attachment.filename}</p>
                      </div>
                    </div>
                    <button
                      className={`px-3 py-1 ${selectedAttachment?.index === index ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'} rounded-md hover:bg-blue-600 hover:text-white transition-colors`}
                    >
                      {selectedAttachment?.index === index ? 'Viewing' : 'View'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
