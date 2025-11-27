import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAddQuestion, useUpdateQuestion } from '../../hooks/useQuizzes';
import { CreateQuestionData, UpdateQuestionData, Question, QuestionType } from '../../types/quiz';

interface QuestionFormProps {
  quizId: string;
  initialData?: Question;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  quizId,
  initialData,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const isEditing = !!initialData;
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialData?.type || QuestionType.MULTIPLE_CHOICE
  );

  const addQuestionMutation = useAddQuestion();
  const updateQuestionMutation = useUpdateQuestion();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateQuestionData>({
    defaultValues: initialData ? {
      quizId: initialData.quiz,
      question: initialData.question,
      type: initialData.type,
      options: initialData.options || [],
      correctAnswer: initialData.correctAnswer,
      explanation: initialData.explanation || '',
      points: initialData.points,
      order: initialData.order,
      isActive: initialData.isActive
    } : {
      quizId,
      question: '',
      type: QuestionType.MULTIPLE_CHOICE,
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      order: 1,
      isActive: true
    }
  });

  const watchedOptions = watch('options') || [];

  const onSubmit = async (data: CreateQuestionData) => {
    try {
      if (isEditing && initialData) {
        await updateQuestionMutation.mutateAsync({
          questionId: initialData._id,
          questionData: data as UpdateQuestionData
        });
      } else {
        await addQuestionMutation.mutateAsync({
          quizId,
          questionData: data
        });
      }
      
      onSuccess?.();
      
      if (!onSuccess) {
        // Default navigation
        if (isEditing) {
          navigate(`/admin/quizzes/${quizId}`);
        } else {
          navigate(`/admin/quizzes/${quizId}`);
        }
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      navigate(`/admin/quizzes/${quizId}`);
    }
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    setValue('type', type);
    
    // Reset options and correct answer when changing type
    if (type === QuestionType.TRUE_FALSE) {
      setValue('options', ['True', 'False']);
      setValue('correctAnswer', '');
    } else if (type === QuestionType.MULTIPLE_CHOICE) {
      setValue('options', ['', '', '', '']);
      setValue('correctAnswer', '');
    } else {
      setValue('options', []);
      setValue('correctAnswer', '');
    }
  };

  const addOption = () => {
    const currentOptions = watchedOptions;
    setValue('options', [...currentOptions, '']);
  };

  const removeOption = (index: number) => {
    const currentOptions = watchedOptions.filter((_, i) => i !== index);
    setValue('options', currentOptions);
    
    // If the correct answer was the removed option, clear it
    const currentCorrectAnswer = watch('correctAnswer');
    if (Array.isArray(currentCorrectAnswer) && currentCorrectAnswer.includes(watchedOptions[index])) {
      setValue('correctAnswer', currentCorrectAnswer.filter(ans => ans !== watchedOptions[index]));
    } else if (currentCorrectAnswer === watchedOptions[index]) {
      setValue('correctAnswer', '');
    }
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = [...watchedOptions];
    currentOptions[index] = value;
    setValue('options', currentOptions);
  };

  const renderQuestionTypeFields = () => {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              {watchedOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  <input
                    type="radio"
                    {...register('correctAnswer', { required: 'Please select a correct answer' })}
                    value={option}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={watchedOptions.length <= 2}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-blue-600 hover:text-blue-900 flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-1" />
                Add Option
              </button>
              {errors.correctAnswer && (
                <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>
              )}
            </div>
          </div>
        );

      case QuestionType.TRUE_FALSE:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="radio"
                    {...register('correctAnswer', { required: 'Please select a correct answer' })}
                    value={option}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-700">{option}</label>
                </div>
              ))}
            </div>
            {errors.correctAnswer && (
              <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>
            )}
          </div>
        );

      case QuestionType.FILL_BLANK:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <input
              type="text"
              {...register('correctAnswer', { required: 'Correct answer is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the correct answer"
            />
            {errors.correctAnswer && (
              <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>
            )}
          </div>
        );

      case QuestionType.ESSAY:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sample Answer (Optional)
            </label>
            <textarea
              {...register('correctAnswer')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide a sample answer for reference"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Question' : 'Add New Question'}
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Question Type */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Question Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(QuestionType).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleQuestionTypeChange(type)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  questionType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Question Content</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                {...register('question', { required: 'Question text is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your question here..."
              />
              {errors.question && (
                <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
              )}
            </div>

            {renderQuestionTypeFields()}
          </div>
        </div>

        {/* Question Settings */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Question Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                {...register('points', { 
                  required: 'Points are required',
                  min: { value: 1, message: 'Points must be at least 1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                min="1"
              />
              {errors.points && (
                <p className="text-red-500 text-sm mt-1">{errors.points.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order *
              </label>
              <input
                type="number"
                {...register('order', { 
                  required: 'Order is required',
                  min: { value: 1, message: 'Order must be at least 1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                min="1"
              />
              {errors.order && (
                <p className="text-red-500 text-sm mt-1">{errors.order.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Question is active
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Explanation (Optional)</h3>
          <textarea
            {...register('explanation')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide an explanation for the correct answer..."
          />
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
            disabled={isSubmitting || addQuestionMutation.isPending || updateQuestionMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
            {isSubmitting || addQuestionMutation.isPending || updateQuestionMutation.isPending
              ? 'Saving...'
              : isEditing
              ? 'Update Question'
              : 'Add Question'
            }
          </button>
        </div>
      </form>
    </div>
  );
}; 