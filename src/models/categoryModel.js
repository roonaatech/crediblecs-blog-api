import { query, queryOne, insert, execute } from '../config/database.js';

/**
 * Category Data Access Layer
 */

/**
 * Get all active categories with post counts
 */
export async function findAll() {
  const sql = `
    SELECT 
      c.*,
      COUNT(CASE WHEN p.status = 'published' AND p.is_deleted = FALSE THEN 1 END) AS post_count
    FROM categories c
    LEFT JOIN posts p ON c.id = p.category_id
    WHERE c.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `;
  return query(sql);
}

/**
 * Get all categories (admin - including inactive)
 */
export async function findAllAdmin() {
  const sql = `
    SELECT 
      c.*,
      COUNT(p.id) AS total_post_count
    FROM categories c
    LEFT JOIN posts p ON c.id = p.category_id AND p.is_deleted = FALSE
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `;
  return query(sql);
}

/**
 * Find category by slug
 */
export async function findBySlug(slug) {
  const sql = `SELECT * FROM categories WHERE slug = ? AND is_active = TRUE`;
  return queryOne(sql, [slug]);
}

/**
 * Find category by ID
 */
export async function findById(id) {
  const sql = `SELECT * FROM categories WHERE id = ?`;
  return queryOne(sql, [id]);
}

/**
 * Create a category
 */
export async function create(data) {
  const sql = `
    INSERT INTO categories (name, slug, description, parent_id, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  return insert(sql, [data.name, data.slug, data.description, data.parent_id, data.display_order, data.is_active]);
}

/**
 * Update a category
 */
export async function update(id, data) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return 0;
  values.push(id);
  const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  return execute(sql, values);
}

/**
 * Delete a category (only if no posts reference it)
 */
export async function remove(id) {
  // Set posts to uncategorized (null)
  await execute('UPDATE posts SET category_id = NULL WHERE category_id = ?', [id]);
  return execute('DELETE FROM categories WHERE id = ?', [id]);
}
