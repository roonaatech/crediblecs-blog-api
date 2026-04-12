import Joi from 'joi';

/**
 * Validation schemas for Auth endpoints
 */

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(150).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required()
      .messages({ 'string.min': 'Password must be at least 8 characters' }),
    bio: Joi.string().max(1000).allow('', null),
    designation: Joi.string().max(150).allow('', null),
    role: Joi.string().valid('admin', 'editor', 'author').default('author'),
  }),
};

/**
 * Validation schemas for Category endpoints
 */

export const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    parent_id: Joi.number().integer().positive().allow(null),
    display_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
  }),
};

export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string().max(500).allow('', null),
    parent_id: Joi.number().integer().positive().allow(null),
    display_order: Joi.number().integer().min(0),
    is_active: Joi.boolean(),
  }).min(1),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

/**
 * Validation schemas for Tag endpoints
 */

export const createTagSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(80).required(),
  }),
};
