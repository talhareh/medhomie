import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/categoryModel';
import { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create a new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    // Only admin can create categories
    if (authReq.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only administrators can create categories' });
      return;
    }

    const { name, description, parent } = req.body;

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Create new category
    const category = new Category({
      name,
      description,
      slug,
      parent: parent || null
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const categories = await Category.find().populate('parent');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    const category = await Category.findById(id).populate('parent');
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    // Only admin can update categories
    if (authReq.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only administrators can update categories' });
      return;
    }
    const { id } = req.params;
    const { name, description, parent } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if trying to set category as its own parent
    if (parent && parent === id) {
      res.status(400).json({ message: 'Category cannot be its own parent' });
      return;
    }

    // Check if parent exists if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        res.status(400).json({ message: 'Parent category not found' });
        return;
      }

      // Check for circular reference
      let currentParent = parent;
      while (currentParent) {
        if (currentParent === id) {
          res.status(400).json({ message: 'Circular parent reference detected' });
          return;
        }
        const parentCat = await Category.findById(currentParent);
        currentParent = parentCat?.parent?.toString() || null;
      }
    }

    // Generate slug if name is updated
    let slug = category.slug;
    if (name && name !== category.name) {
      // Check if new name already exists
      const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
      if (existingCategory) {
        res.status(400).json({ message: 'Category with this name already exists' });
        return;
      }
      slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { 
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        slug,
        parent: parent || null
      },
      { new: true }
    ).populate('parent');

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    // Only admin can delete categories
    if (authReq.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Only administrators can delete categories' });
      return;
    }
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if category has children
    const childCategories = await Category.find({ parent: id });
    if (childCategories.length > 0) {
      res.status(400).json({ 
        message: 'Cannot delete category with child categories. Please reassign or delete child categories first.',
        childCategories
      });
      return;
    }

    // Check if category is used in any courses
    // This would require importing the Course model and checking for references
    // For now, we'll assume this check is done elsewhere or will be added later

    // Delete category
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};
