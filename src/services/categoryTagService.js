import * as categoryModel from '../models/categoryModel.js';
import * as tagModel from '../models/tagModel.js';
import { generateUniqueSlug } from '../utils/slugify.js';

/**
 * Category Service
 */

export async function getCategories() {
  return categoryModel.findAll();
}

export async function getCategoriesAdmin() {
  return categoryModel.findAllAdmin();
}

export async function getCategoryBySlug(slug) {
  const category = await categoryModel.findBySlug(slug);
  if (!category) {
    throw Object.assign(new Error('Category not found.'), { statusCode: 404 });
  }
  return category;
}

export async function createCategory(data) {
  const slug = await generateUniqueSlug(data.name, 'categories');
  const id = await categoryModel.create({ ...data, slug });
  return categoryModel.findById(id);
}

export async function updateCategory(id, data) {
  const existing = await categoryModel.findById(id);
  if (!existing) {
    throw Object.assign(new Error('Category not found.'), { statusCode: 404 });
  }

  const updateData = { ...data };
  if (data.name && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, 'categories', id);
  }

  await categoryModel.update(id, updateData);
  return categoryModel.findById(id);
}

export async function deleteCategory(id) {
  const existing = await categoryModel.findById(id);
  if (!existing) {
    throw Object.assign(new Error('Category not found.'), { statusCode: 404 });
  }
  await categoryModel.remove(id);
  return { message: 'Category deleted successfully.' };
}

/**
 * Tag Service
 */

export async function getTags() {
  return tagModel.findAll();
}

export async function getPopularTags(limit = 20) {
  return tagModel.findPopular(limit);
}

export async function createTag(data) {
  const slug = await generateUniqueSlug(data.name, 'tags');
  const id = await tagModel.create({ name: data.name, slug });
  return tagModel.findById(id);
}

export async function deleteTag(id) {
  const existing = await tagModel.findById(id);
  if (!existing) {
    throw Object.assign(new Error('Tag not found.'), { statusCode: 404 });
  }
  await tagModel.remove(id);
  return { message: 'Tag deleted successfully.' };
}
