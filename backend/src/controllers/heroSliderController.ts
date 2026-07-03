import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { HeroSlider } from '../models/HeroSlider';

const MAX_PUBLIC_SLIDES = 5;

const toBoolean = (value: unknown, defaultValue = true): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return defaultValue;
};

const toNumber = (value: unknown, defaultValue = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const removeUploadedFile = (storedPath?: string) => {
  if (!storedPath) return;

  const normalizedPath = storedPath.startsWith('uploads/')
    ? storedPath
    : storedPath.replace(/^\/+/, '');
  const absolutePath = path.join(__dirname, '../../', normalizedPath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

export const getPublicHeroSliders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sliders = await HeroSlider.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(MAX_PUBLIC_SLIDES)
      .lean();

    res.json(sliders);
  } catch (error) {
    console.error('Error fetching public hero sliders:', error);
    res.status(500).json({ message: 'Error fetching hero sliders' });
  }
};

export const getAllHeroSliders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sliders = await HeroSlider.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    res.json(sliders);
  } catch (error) {
    console.error('Error fetching hero sliders:', error);
    res.status(500).json({ message: 'Error fetching hero sliders' });
  }
};

export const createHeroSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Hero slider image is required' });
      return;
    }

    const title = String(req.body.title || '').trim();
    const altText = String(req.body.altText || '').trim();
    const isActive = toBoolean(req.body.isActive, true);
    const sortOrder = toNumber(req.body.sortOrder, 0);

    if (!title) {
      removeUploadedFile(req.file.path);
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    if (!altText) {
      removeUploadedFile(req.file.path);
      res.status(400).json({ message: 'Alt text is required' });
      return;
    }

    const slider = await HeroSlider.create({
      title,
      altText,
      image: req.file.path,
      isActive,
      sortOrder,
    });

    res.status(201).json(slider);
  } catch (error) {
    if (req.file?.path) {
      removeUploadedFile(req.file.path);
    }
    console.error('Error creating hero slider:', error);
    res.status(500).json({ message: 'Error creating hero slider' });
  }
};

export const updateHeroSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const slider = await HeroSlider.findById(req.params.heroSliderId);
    if (!slider) {
      if (req.file?.path) {
        removeUploadedFile(req.file.path);
      }
      res.status(404).json({ message: 'Hero slider not found' });
      return;
    }

    const nextTitle = Object.prototype.hasOwnProperty.call(req.body, 'title')
      ? String(req.body.title || '').trim()
      : slider.title;
    const nextAltText = Object.prototype.hasOwnProperty.call(req.body, 'altText')
      ? String(req.body.altText || '').trim()
      : slider.altText;

    if (!nextTitle) {
      if (req.file?.path) {
        removeUploadedFile(req.file.path);
      }
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    if (!nextAltText) {
      if (req.file?.path) {
        removeUploadedFile(req.file.path);
      }
      res.status(400).json({ message: 'Alt text is required' });
      return;
    }

    const previousImage = slider.image;
    slider.title = nextTitle;
    slider.altText = nextAltText;

    if (Object.prototype.hasOwnProperty.call(req.body, 'isActive')) {
      slider.isActive = toBoolean(req.body.isActive, slider.isActive);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'sortOrder')) {
      slider.sortOrder = toNumber(req.body.sortOrder, slider.sortOrder);
    }

    if (req.file?.path) {
      slider.image = req.file.path;
    }

    await slider.save();

    if (req.file?.path && previousImage && previousImage !== slider.image) {
      removeUploadedFile(previousImage);
    }

    res.json(slider);
  } catch (error) {
    if (req.file?.path) {
      removeUploadedFile(req.file.path);
    }
    console.error('Error updating hero slider:', error);
    res.status(500).json({ message: 'Error updating hero slider' });
  }
};

export const deleteHeroSlider = async (req: Request, res: Response): Promise<void> => {
  try {
    const slider = await HeroSlider.findByIdAndDelete(req.params.heroSliderId);
    if (!slider) {
      res.status(404).json({ message: 'Hero slider not found' });
      return;
    }

    removeUploadedFile(slider.image);
    res.json({ message: 'Hero slider deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slider:', error);
    res.status(500).json({ message: 'Error deleting hero slider' });
  }
};
