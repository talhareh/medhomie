import Joi from 'joi';
import { CourseState } from '../models/Course';

export const validateLesson = (lesson: any) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    order: Joi.number().required().min(0),
    duration: Joi.number().optional().min(0),
    video: Joi.string().optional(),
    attachments: Joi.array().items(Joi.string()).default([]),
    isPreview: Joi.boolean().default(false)
  });

  return schema.validate(lesson);
};

export const validateModule = (module: any) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    order: Joi.number().required().min(0),
    lessons: Joi.array().items(Joi.object({
      title: Joi.string().required().min(3).max(255),
      description: Joi.string().required().min(10),
      order: Joi.number().required().min(0),
      duration: Joi.number().optional().min(0),
      video: Joi.string().optional(),
      attachments: Joi.array().items(Joi.string()).default([]),
      isPreview: Joi.boolean().default(false)
    })).default([])
  });

  return schema.validate(module);
};

export const validateCourse = (course: any) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    price: Joi.number().required().min(0),
    thumbnail: Joi.string().allow(null, ''),
    banner: Joi.string().allow(null, ''),
    state: Joi.string().valid(...Object.values(CourseState)),
    createdBy: Joi.string().required(),
    modules: Joi.array().items(Joi.object({
      title: Joi.string().required().min(3).max(255),
      description: Joi.string().required().min(10),
      order: Joi.number().required().min(0),
      lessons: Joi.array().items(Joi.object({
        title: Joi.string().required().min(3).max(255),
        description: Joi.string().required().min(10),
        order: Joi.number().required().min(0),
        duration: Joi.number().optional().min(0),
        video: Joi.string().optional(),
        attachments: Joi.array().items(Joi.string()).default([]),
        isPreview: Joi.boolean().default(false)
      })).default([])
    })).default([]),
    noticeBoard: Joi.array().items(Joi.string()).default([]),
    enrollmentCount: Joi.number().default(0)
  });

  return schema.validate(course);
};

export const validateCourseStateUpdate = (course: any) => {
  const schema = Joi.object({
    state: Joi.string().valid(...Object.values(CourseState)).required()
  });

  return schema.validate(course);
};

export const validateCourseActivation = (course: any) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    price: Joi.number().required().min(0),
    thumbnail: Joi.string().required(),
    modules: Joi.array().min(1).required().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      lessons: Joi.array().min(1).required()
    }))
  }).unknown(true);

  return schema.validate(course);
};
