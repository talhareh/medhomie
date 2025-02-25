import { Request, Response } from 'express';
import { Course, CourseState, ICourseData, IModuleData, IModuleDocument } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { validateCourse, validateModule, validateCourseStateUpdate, validateCourseActivation } from '../validators/courseValidator';
import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';

interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

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
    const courses = await Course.find({ state: CourseState.ACTIVE })
      .select('title description price thumbnail');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Get course details
export const getCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('modules')
      .populate('createdBy', 'name email');
      
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is admin (through auth middleware)
    const isAdmin = (req as AuthRequest).user?.role === 'admin';

    // If course is not active and user is not admin, don't show details
    if (course.state !== CourseState.ACTIVE && !isAdmin) {
      res.status(403).json({ message: 'Course is not available' });
      return;
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ message: 'Error fetching course details' });
  }
};

// Create a new course (admin or instructor)
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const courseData: ICourseData = {
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      state: CourseState.DRAFT,
      createdBy: req.user._id,
      modules: [],
      noticeBoard: [],
      enrollmentCount: 0
    };

    const { error } = validateCourse(courseData);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    // Handle file uploads if present
    if (req.files) {
      const files = req.files as MulterFiles;
      
      if (files.thumbnail) {
        courseData.thumbnail = files.thumbnail[0].path;
      }
      if (files.banner) {
        courseData.banner = files.banner[0].path;
      }
    }

    const course = new Course(courseData);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
};

// Update course state (admin only)
export const updateCourseState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { state } = req.body;
    const { error } = validateCourseStateUpdate({ state });
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Additional validation for activating a course
    if (state === CourseState.ACTIVE) {
      const { error: activationError } = validateCourseActivation(course);
      if (activationError) {
        res.status(400).json({ message: activationError.details[0].message });
        return;
      }
    }

    course.state = state;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course state' });
  }
};

// Update a course (admin or instructor)
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $set: req.body },
      { new: true, runValidators: true }
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

// Add a module to a course (admin or instructor)
export const addModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const moduleData: IModuleData = {
      title: req.body.title,
      description: req.body.description,
      order: course.modules.length,
      lessons: []
    };

    const { error } = validateModule(moduleData);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    course.modules.push(moduleData);
    await course.save();
    res.status(201).json(course.modules[course.modules.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding module' });
  }
};

// Update a module (admin or instructor)
export const updateModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(req.params.moduleId) as IModuleDocument | null;
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    // Update module fields
    if (req.body.title) module.title = req.body.title;
    if (req.body.description) module.description = req.body.description;

    const { error } = validateModule(module);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    await course.save();
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error updating module' });
  }
};

// Delete a module (admin or instructor)
export const deleteModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const moduleIndex = course.modules.findIndex(
      module => module._id.toString() === req.params.moduleId
    );

    if (moduleIndex === -1) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    // Remove the module
    course.modules.splice(moduleIndex, 1);
    
    // Update order of remaining modules
    course.modules.forEach((mod, index) => {
      mod.order = index;
    });

    await course.save();
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting module' });
  }
};

// Reorder modules (admin or instructor)
export const reorderModules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const { moduleId, newOrder } = req.body;
    const moduleIndex = course.modules.findIndex(
      module => module._id.toString() === moduleId
    );

    if (moduleIndex === -1) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    if (newOrder < 0 || newOrder >= course.modules.length) {
      res.status(400).json({ message: 'Invalid order position' });
      return;
    }

    // Remove module from current position
    const [module] = course.modules.splice(moduleIndex, 1);
    // Insert at new position
    course.modules.splice(newOrder, 0, module);

    // Update order numbers
    course.modules.forEach((mod, index) => {
      mod.order = index;
    });

    await course.save();
    res.json(course.modules);
  } catch (error) {
    res.status(500).json({ message: 'Error reordering modules' });
  }
};
