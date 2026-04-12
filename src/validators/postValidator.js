import Joi from 'joi';

/**
 * Validation schemas for Post endpoints
 */

export const createPostSchema = {
  body: Joi.object({
    title: Joi.string().min(5).max(300).required()
      .messages({ 'string.min': 'Title must be at least 5 characters' }),
    content: Joi.string().min(50).required()
      .messages({ 'string.min': 'Content must be at least 50 characters' }),
    content_format: Joi.string().valid('html', 'markdown').default('html'),
    excerpt: Joi.string().max(500).allow('', null),
    meta_title: Joi.string().max(200).allow('', null),
    meta_description: Joi.string().max(320).allow('', null),
    og_image_url: Joi.string().uri().max(500).allow('', null),
    canonical_url: Joi.string().uri().max(500).allow('', null),
    featured_image_url: Joi.string().max(500).allow('', null),
    featured_image_alt: Joi.string().max(300).allow('', null),
    category_id: Joi.number().integer().positive().allow(null),
    tag_ids: Joi.array().items(Joi.number().integer().positive()).default([]),
    status: Joi.string().valid('draft', 'published', 'scheduled').default('draft'),
    scheduled_at: Joi.when('status', {
      is: 'scheduled',
      then: Joi.date().iso().greater('now').required(),
      otherwise: Joi.date().iso().allow(null),
    }),
    is_featured: Joi.boolean().default(false),
    allow_comments: Joi.boolean().default(true),
  }),
};

export const updatePostSchema = {
  body: Joi.object({
    title: Joi.string().min(5).max(300),
    content: Joi.string().min(50),
    content_format: Joi.string().valid('html', 'markdown'),
    excerpt: Joi.string().max(500).allow('', null),
    meta_title: Joi.string().max(200).allow('', null),
    meta_description: Joi.string().max(320).allow('', null),
    og_image_url: Joi.string().uri().max(500).allow('', null),
    canonical_url: Joi.string().uri().max(500).allow('', null),
    featured_image_url: Joi.string().max(500).allow('', null),
    featured_image_alt: Joi.string().max(300).allow('', null),
    category_id: Joi.number().integer().positive().allow(null),
    tag_ids: Joi.array().items(Joi.number().integer().positive()),
    status: Joi.string().valid('draft', 'published', 'scheduled', 'archived'),
    scheduled_at: Joi.date().iso().allow(null),
    is_featured: Joi.boolean(),
    allow_comments: Joi.boolean(),
  }).min(1), // At least one field must be provided
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

export const listPostsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(12),
    status: Joi.string().valid('draft', 'published', 'scheduled', 'archived'),
    category_id: Joi.number().integer().positive(),
    author_id: Joi.number().integer().positive(),
    is_featured: Joi.boolean(),
    sort: Joi.string().valid('published_at', '-published_at', 'created_at', '-created_at', 'title', '-title', 'view_count', '-view_count').default('-published_at'),
    search: Joi.string().max(200),
  }),
};

export const statusUpdateSchema = {
  body: Joi.object({
    status: Joi.string().valid('draft', 'published', 'scheduled', 'archived').required(),
    scheduled_at: Joi.when('status', {
      is: 'scheduled',
      then: Joi.date().iso().greater('now').required(),
      otherwise: Joi.date().iso().allow(null),
    }),
  }),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
