import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Blog, BlogStatus, IBlogDocument } from '../models/Blog';
import mongoose from 'mongoose';
import { UserRole } from '../models/User';

// Create a new blog
export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, excerpt, tags, status, readTime } = req.body;
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      res.status(400).json({ 
        success: false, 
        message: 'A blog with this title already exists. Please use a different title.' 
      });
      return;
    }

    // Create the blog
    const newBlog = new Blog({
      title,
      slug,
      content,
      excerpt,
      featuredImage: req.body.featuredImage || null,
      author: req.user?._id,
      status: status || BlogStatus.DRAFT,
      tags: tags || [],
      readTime: readTime || 5
    });

    await newBlog.save();
    
    res.status(201).json({
      success: true,
      data: newBlog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
};

// Get all blogs (with filters)
export const getBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, tag, search, limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    const query: any = {};
    
    // If user is not admin, only show published blogs
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      query.status = BlogStatus.PUBLISHED;
    } else if (status) {
      query.status = status;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Execute query with pagination
    const blogs = await Blog.find(query)
      .populate('author', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
};

// Get a single blog by slug
export const getBlogBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug })
      .populate('author', 'fullName profilePicture');
    
    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }
    
    // If blog is not published and user is not admin, don't show it
    if (blog.status !== BlogStatus.PUBLISHED && 
        (!req.user || req.user.role !== UserRole.ADMIN)) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
};

// Update a blog
export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags, status, readTime } = req.body;
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }
    
    // Check if user is authorized to update the blog
    if (!blog || (req.user?.role !== UserRole.ADMIN && blog.author.toString() !== req.user?._id.toString())) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this blog'
      });
      return;
    }
    
    // If title is being updated, generate a new slug
    let slug = blog.slug;
    if (req.body.title && req.body.title !== blog.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      // Check if new slug already exists
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingBlog) {
        res.status(400).json({
          success: false,
          message: 'A blog with this title already exists. Please use a different title.'
        });
        return;
      }
    }
    
    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: req.body.title || blog.title,
        slug,
        content: req.body.content || blog.content,
        excerpt: req.body.excerpt || blog.excerpt,
        featuredImage: req.body.featuredImage || blog.featuredImage,
        status: req.body.status || blog.status,
        tags: req.body.tags || blog.tags,
        readTime: req.body.readTime || blog.readTime,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('author', 'fullName profilePicture');
    
    res.status(200).json({
      success: true,
      data: updatedBlog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
};

// Delete a blog
export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
};

// Upload blog image
export const uploadBlogImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }
    
    // The file path will be set by multer middleware
    const imagePath = `/uploads/blogs/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        url: imagePath
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};
