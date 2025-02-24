import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { validateCourse } from '../validators/courseValidator';

// Get all courses (admin only)
export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Get public courses
export const getPublicCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({ isApproved: true })
      .select('title description price image');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Get course details
export const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details' });
  }
};

// Create a new course (admin only)
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { error } = validateCourse(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const course = new Course({
      ...req.body,
      instructor: req.user?._id
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course' });
  }
};

// Update a course (admin only)
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = validateCourse(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { new: true }
    );

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course' });
  }
};

// Delete a course (admin only)
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' });
  }
};
