import slugifyLib from 'slugify';
import { query } from '../config/database.js';

/**
 * Generate a URL-friendly slug from a string.
 * If the slug already exists in the given table, appends a numeric suffix.
 * 
 * @param {string} text - Text to slugify (e.g., post title)
 * @param {string} table - Table name to check for uniqueness
 * @param {number|null} excludeId - ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueSlug(text, table, excludeId = null) {
  const baseSlug = slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });

  // Check if slug already exists
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let sql = `SELECT id FROM ${table} WHERE slug = ?`;
    const params = [slug];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const existing = await query(sql, params);

    if (existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
