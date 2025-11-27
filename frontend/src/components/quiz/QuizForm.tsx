import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCreateQuiz, useUpdateQuiz } from '../../hooks/useQuizzes';
import { CreateQuizData, UpdateQuizData, Quiz } from '../../types/quiz';
import { Course } from '../../types/course';
import { courseService } from '../../services/courseService';

interface Lesson {
  _id: string;
  title: string;
  module: string;
}

interface QuizFormProps {
  initialData?: Quiz;
  courseId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  initialData,
  courseId: propCourseId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isEditing = !!initialData;
  
  // Get courseId from props or URL parameters
  const courseId = propCourseId || searchParams.get('courseId') || '';
  
  console.log('CourseId from props/URL:', { propCourseId, urlCourseId: searchParams.get('courseId'), finalCourseId: courseId });

  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();

  // Get courses for course selection (if not provided)
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Get lessons for the selected course
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateQuizData>({
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || '',
      courseId: initialData.course,
      lessonId: initialData.lesson || undefined,
      timeLimit: initialData.timeLimit || undefined,
      passingScore: initialData.passingScore,
      maxAttempts: initialData.maxAttempts,
      isActive: initialData.isActive,
      shuffleQuestions: initialData.shuffleQuestions,
      showCorrectAnswers: initialData.showCorrectAnswers,
      allowReview: initialData.allowReview
    } : {
      title: '',
      description: '',
      courseId: courseId || '',
      lessonId: undefined,
      timeLimit: undefined,
      passingScore: 70,
      maxAttempts: 3,
      isActive: true,
      shuffleQuestions: false,
      showCorrectAnswers: true,
      allowReview: true
    }
  });

  const watchedCourseId = watch('courseId');

  React.useEffect(() => {
    setLoadingCourses(true);
    courseService.getAllCourses()
      .then((data) => {
        setCourses(data);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      })
      .finally(() => {
        setLoadingCourses(false);
      });
  }, []);

  // Fetch lessons when course changes
  React.useEffect(() => {
    const fetchLessons = async () => {
      if (!watchedCourseId) {
        setLessons([]);
        return;
      }
      
      setLoadingLessons(true);
      try {
        const response = await courseService.getCourse(watchedCourseId);
        const courseData = response;
        
        // Extract all lessons from all modules
        const allLessons: Lesson[] = [];
        if (courseData.modules) {
          courseData.modules.forEach((module: any) => {
            if (module.lessons) {
              module.lessons.forEach((lesson: any) => {
                allLessons.push({
                  _id: lesson._id,
                  title: lesson.title,
                  module: module.title
                });
              });
            }
          });
        }
        setLessons(allLessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Failed to load lessons');
        setLessons([]);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, [watchedCourseId]);

  const onSubmit = async (data: CreateQuizData) => {
    console.log('Submitting quiz data:', data);
    try {
      if (isEditing && initialData) {
        await updateQuizMutation.mutateAsync({
          quizId: initialData._id,
          quizData: data as UpdateQuizData
        });
      } else {
        await createQuizMutation.mutateAsync(data);
      }
      
      // Only call onSuccess if provided, otherwise use default navigation
      if (onSuccess) {
        onSuccess();
      } else {
        // Default navigation
        if (isEditing) {
          navigate(`/admin/quizzes/${initialData._id}`);
        } else {
          navigate('/admin/quizzes');
        }
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      navigate('/admin/quizzes');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Quiz title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              {courseId ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  {courses.find(c => c._id === courseId)?.title || 'Loading...'}
                </div>
              ) : (
                <select
                  {...register('courseId', { required: 'Course is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingCourses}
                >
                  <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
                  {courses.map((course: Course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              )}
              {errors.courseId && (
                <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>
              )}
            </div>
          </div>

          {/* Lesson Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach to Lesson (Optional)
            </label>
            <select
              {...register('lessonId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingLessons || !watchedCourseId}
            >
              <option value="">
                {!watchedCourseId 
                  ? 'Select a course first' 
                  : loadingLessons 
                    ? 'Loading lessons...' 
                    : 'No lesson (course-level quiz)'
                }
              </option>
              {lessons.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.module} - {lesson.title}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Select a lesson to attach this quiz to. If left empty, the quiz will be available at the course level.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quiz description (optional)"
            />
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                {...register('timeLimit', { min: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="No limit"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">Leave empty for no time limit</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%) *
              </label>
              <input
                type="number"
                {...register('passingScore', { 
                  required: 'Passing score is required',
                  min: { value: 0, message: 'Passing score must be at least 0' },
                  max: { value: 100, message: 'Passing score cannot exceed 100' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="70"
                min="0"
                max="100"
              />
              {errors.passingScore && (
                <p className="text-red-500 text-sm mt-1">{errors.passingScore.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Attempts *
              </label>
              <input
                type="number"
                {...register('maxAttempts', { 
                  required: 'Max attempts is required',
                  min: { value: 1, message: 'Max attempts must be at least 1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3"
                min="1"
              />
              {errors.maxAttempts && (
                <p className="text-red-500 text-sm mt-1">{errors.maxAttempts.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Quiz is active and available to students
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('shuffleQuestions')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Shuffle questions for each attempt
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('showCorrectAnswers')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Show correct answers after submission
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('allowReview')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Allow students to review their answers
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || createQuizMutation.isPending || updateQuizMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
            {isSubmitting || createQuizMutation.isPending || updateQuizMutation.isPending
              ? 'Saving...'
              : isEditing
              ? 'Update Quiz'
              : 'Create Quiz'
            }
          </button>
        </div>
      </form>
    </div>
  );
}; 