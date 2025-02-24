import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

// Add content to course
export const addCourseContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    course.content.push({
      title,
      description,
      video: file.path,
      attachments: []
    });

    await course.save();
    res.status(201).json({ message: 'Content added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding course content', error });
  }
};

// Remove content from course
export const removeCourseContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, contentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const contentIndex = course.content.findIndex(
      content => content._id?.toString() === contentId
    );

    if (contentIndex === -1) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    course.content.splice(contentIndex, 1);
    await course.save();
    
    res.status(200).json({ message: 'Content removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing course content', error });
  }
};

// View course content
export const viewCourseContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, contentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const content = course.content.find(
      content => content._id?.toString() === contentId
    );

    if (!content) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error viewing course content', error });
  }
};

// Add notice to course
export const addNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { notice } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    course.noticeBoard.push(notice);
    await course.save();

    res.status(201).json({ message: 'Notice added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding notice', error });
  }
};

// Remove notice from course
export const removeNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, noticeId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const noticeIndex = course.noticeBoard.findIndex(
      (_, index) => index.toString() === noticeId
    );

    if (noticeIndex === -1) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    course.noticeBoard.splice(noticeIndex, 1);
    await course.save();

    res.status(200).json({ message: 'Notice removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing notice', error });
  }
};
