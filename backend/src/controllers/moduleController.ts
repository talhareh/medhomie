import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { validateModule } from '../validators/courseValidator';

// Add a new module to a course
export const addModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const moduleData = {
      title,
      description,
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

    res.status(201).json({ message: 'Module added successfully', module: moduleData });
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({ message: 'Error adding module', error });
  }
};

// Update module details
export const updateModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    // Update module fields
    if (title) module.title = title;
    if (description) module.description = description;

    const { error } = validateModule(module);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    await course.save();
    res.status(200).json({ message: 'Module updated successfully', module });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Error updating module', error });
  }
};

// Delete a module
export const deleteModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const moduleIndex = course.modules.findIndex(
      module => module._id?.toString() === moduleId
    );

    if (moduleIndex === -1) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    // Remove the module
    course.modules.splice(moduleIndex, 1);

    // Reorder remaining modules
    course.modules.forEach((module, index) => {
      module.order = index;
    });

    await course.save();
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Error deleting module', error });
  }
};

// Get module details
export const getModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      res.status(404).json({ message: 'Module not found' });
      return;
    }

    res.status(200).json(module);
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({ message: 'Error getting module', error });
  }
};

// Reorder modules
export const reorderModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body;

    if (!Array.isArray(moduleIds)) {
      res.status(400).json({ message: 'moduleIds must be an array' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Verify all moduleIds exist
    const moduleExists = moduleIds.every(id => 
      course.modules.some(module => module._id?.toString() === id)
    );

    if (!moduleExists) {
      res.status(400).json({ message: 'One or more module IDs are invalid' });
      return;
    }

    // Create a new ordered array of modules
    const orderedModules = moduleIds.map((id, index) => {
      const module = course.modules.find(m => m._id?.toString() === id);
      if (module) {
        module.order = index;
      }
      return module;
    }).filter(Boolean);

    // Replace the modules array with the reordered one
    course.modules = orderedModules as typeof course.modules;
    await course.save();

    res.status(200).json({ message: 'Modules reordered successfully' });
  } catch (error) {
    console.error('Error reordering modules:', error);
    res.status(500).json({ message: 'Error reordering modules', error });
  }
};
