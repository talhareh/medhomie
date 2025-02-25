import { Request, Response } from 'express';
import { Course, IModuleDocument, ILessonDocument, ILessonData } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { validateLesson } from '../validators/courseValidator';
import path from 'path';
import fs from 'fs';

// Add lesson to a module
export const addLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    const file = req.file;
    
    console.log('Request file:', file);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lessonData: ILessonData = {
      title: req.body.title,
      description: req.body.description,
      order: module.lessons.length,
      duration: req.body.duration ? parseInt(req.body.duration) : undefined,
      video: file?.path,
      attachments: [],
      isPreview: req.body.isPreview === 'true'
    };

    const { error } = validateLesson(lessonData);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    module.lessons.push(lessonData);
    await course.save();

    res.status(201).json({ message: 'Lesson added successfully', lesson: lessonData });
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ message: 'Error adding lesson', error });
  }
};

// Remove lesson from a module
export const removeLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lessonIndex = module.lessons.findIndex(
      lesson => lesson._id.toString() === lessonId
    );

    if (lessonIndex === -1) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    // Remove the lesson
    module.lessons.splice(lessonIndex, 1);

    // Reorder remaining lessons
    module.lessons.forEach((lesson, index) => {
      lesson.order = index;
    });

    await course.save();
    res.status(200).json({ message: 'Lesson removed successfully' });
  } catch (error) {
    console.error('Error removing lesson:', error);
    res.status(500).json({ message: 'Error removing lesson', error });
  }
};

// Update lesson details
export const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const file = req.file;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lesson = module.lessons.id(lessonId) as ILessonDocument | null;
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    // Update lesson fields
    if (req.body.title) lesson.title = req.body.title;
    if (req.body.description) lesson.description = req.body.description;
    if (req.body.duration) {
      lesson.duration = parseInt(req.body.duration);
    }
    if (file) {
      lesson.video = file.path;
    }
    if (typeof req.body.isPreview === 'boolean') {
      lesson.isPreview = req.body.isPreview;
    }

    const { error } = validateLesson(lesson);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    await course.save();
    res.status(200).json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Error updating lesson', error });
  }
};

// Get lesson details
export const getLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    const lesson = module.lessons.id(lessonId) as ILessonDocument | null;
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    res.status(200).json(lesson);
  } catch (error) {
    console.error('Error getting lesson:', error);
    res.status(500).json({ message: 'Error getting lesson', error });
  }
};

// Add notice to course
export const addNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { notice } = req.body;

    if (!notice || typeof notice !== 'string' || notice.trim().length === 0) {
      res.status(400).json({ message: 'Notice text is required' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    course.noticeBoard.push(notice.trim());
    await course.save();

    res.status(201).json({ message: 'Notice added successfully' });
  } catch (error) {
    console.error('Error adding notice:', error);
    res.status(500).json({ message: 'Error adding notice', error });
  }
};

// Remove notice from course
export const removeNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { noticeIndex } = req.body;

    if (typeof noticeIndex !== 'number' || noticeIndex < 0) {
      res.status(400).json({ message: 'Valid notice index is required' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (noticeIndex >= course.noticeBoard.length) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    course.noticeBoard.splice(noticeIndex, 1);
    await course.save();

    res.status(200).json({ message: 'Notice removed successfully' });
  } catch (error) {
    console.error('Error removing notice:', error);
    res.status(500).json({ message: 'Error removing notice', error });
  }
};
