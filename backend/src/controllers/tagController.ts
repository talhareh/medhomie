import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tag from '../models/tagModel';
import { UserRole } from '../models/User';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: UserRole;
  };
}

// Create a new tag
export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admin can create tags
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only administrators can create tags' });
      return;
    }

    const { name } = req.body;

    // Check if tag with same name already exists
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      res.status(400).json({ message: 'Tag with this name already exists' });
      return;
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Create new tag
    const tag = new Tag({
      name,
      slug
    });

    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tag', error });
  }
};

// Get all tags
export const getAllTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error });
  }
};

// Get tag by ID
export const getTagById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid tag ID' });
      return;
    }

    const tag = await Tag.findById(id);
    
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tag', error });
  }
};

// Update tag
export const updateTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Only admin can update tags
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only administrators can update tags' });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid tag ID' });
      return;
    }

    // Check if tag exists
    const tag = await Tag.findById(id);
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    // If name is being updated, check for duplicates
    let slug = tag.slug;
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ name, _id: { $ne: id } });
      if (existingTag) {
        res.status(400).json({ message: 'Tag with this name already exists' });
        return;
      }
      
      // Update slug if name changes
      slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    // Update tag
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { 
        name: name || tag.name,
        slug
      },
      { new: true }
    );

    res.status(200).json(updatedTag);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tag', error });
  }
};

// Delete tag
export const deleteTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Only admin can delete tags
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only administrators can delete tags' });
      return;
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid tag ID' });
      return;
    }

    // Check if tag exists
    const tag = await Tag.findById(id);
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    // Check if tag is used in any courses
    const Course = mongoose.model('Course');
    const coursesWithTag = await Course.countDocuments({ tags: id });
    
    if (coursesWithTag > 0) {
      res.status(400).json({ 
        message: `Cannot delete tag that is used in ${coursesWithTag} courses. Remove the tag from all courses first.` 
      });
      return;
    }

    await Tag.findByIdAndDelete(id);
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag', error });
  }
};
