import { query, queryOne, insert, execute } from '../config/database.js';

/**
 * Author Data Access Layer
 */

/**
 * Find author by email (for authentication)
 */
export async function findByEmail(email) {
  const sql = `SELECT * FROM authors WHERE email = ? AND is_active = TRUE`;
  return queryOne(sql, [email]);
}

/**
 * Find author by ID
 */
export async function findById(id) {
  const sql = `
    SELECT id, name, email, slug, bio, avatar_url, designation, social_links, role, is_active, created_at
    FROM authors WHERE id = ? AND is_active = TRUE
  `;
  return queryOne(sql, [id]);
}

/**
 * Find author by slug (public profile)
 */
export async function findBySlug(slug) {
  const sql = `
    SELECT id, name, slug, bio, avatar_url, designation, social_links, created_at
    FROM authors WHERE slug = ? AND is_active = TRUE
  `;
  return queryOne(sql, [slug]);
}

/**
 * Get all authors
 */
export async function findAll() {
  const sql = `
    SELECT id, name, slug, bio, avatar_url, designation, role, is_active, created_at
    FROM authors
    ORDER BY name ASC
  `;
  return query(sql);
}

/**
 * Create a new author
 */
export async function create(authorData) {
  const sql = `
    INSERT INTO authors (name, email, password_hash, slug, bio, avatar_url, designation, social_links, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return insert(sql, [
    authorData.name, authorData.email, authorData.password_hash,
    authorData.slug, authorData.bio, authorData.avatar_url,
    authorData.designation, JSON.stringify(authorData.social_links || {}),
    authorData.role,
  ]);
}

/**
 * Update author profile
 */
export async function update(id, data) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === 'social_links') {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const sql = `UPDATE authors SET ${fields.join(', ')} WHERE id = ?`;
  return execute(sql, values);
}
