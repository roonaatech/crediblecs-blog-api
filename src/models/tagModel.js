import { query, queryOne, insert, execute } from '../config/database.js';

/**
 * Tag Data Access Layer
 */

/**
 * Get all tags with post counts
 */
export async function findAll() {
  const sql = `
    SELECT 
      t.*,
      COUNT(CASE WHEN p.status = 'published' AND p.is_deleted = FALSE THEN 1 END) AS post_count
    FROM tags t
    LEFT JOIN post_tags pt ON t.id = pt.tag_id
    LEFT JOIN posts p ON pt.post_id = p.id
    GROUP BY t.id
    ORDER BY t.name ASC
  `;
  return query(sql);
}

/**
 * Find tag by slug
 */
export async function findBySlug(slug) {
  const sql = `SELECT * FROM tags WHERE slug = ?`;
  return queryOne(sql, [slug]);
}

/**
 * Find tag by ID
 */
export async function findById(id) {
  const sql = `SELECT * FROM tags WHERE id = ?`;
  return queryOne(sql, [id]);
}

/**
 * Create a tag
 */
export async function create(data) {
  const sql = `INSERT INTO tags (name, slug) VALUES (?, ?)`;
  return insert(sql, [data.name, data.slug]);
}

/**
 * Delete a tag
 */
export async function remove(id) {
  // Remove from junction table first (CASCADE should handle, but explicit is better)
  await execute('DELETE FROM post_tags WHERE tag_id = ?', [id]);
  return execute('DELETE FROM tags WHERE id = ?', [id]);
}

/**
 * Get popular tags (by post count)
 */
export async function findPopular(limit = 20) {
  const sql = `
    SELECT 
      t.*,
      COUNT(pt.post_id) AS post_count
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    INNER JOIN posts p ON pt.post_id = p.id
    WHERE p.status = 'published' AND p.is_deleted = FALSE
    GROUP BY t.id
    ORDER BY post_count DESC
    LIMIT ?
  `;
  return query(sql, [limit]);
}
