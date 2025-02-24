import Joi from 'joi';

export const validateCourse = (course: any) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
    price: Joi.number().required().min(0),
    image: Joi.string().optional(),
  });

  return schema.validate(course);
};

export const validateCourseContent = (content: any) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(255),
    description: Joi.string().required().min(10),
  });

  return schema.validate(content);
};
