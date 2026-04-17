import { query, queryOne, insert, execute } from '../config/database.js';

/**
 * Post Data Access Layer
 * All database queries related to blog posts.
 */

/**
 * Get published posts with pagination, filtering, and sorting
 */
export async function findPublished({ limit, offset, categoryId, authorId, isFeatured, sort, search }) {
  let sql = `
    SELECT 
      p.id, p.title, p.slug, p.excerpt, p.content_format,
      p.featured_image_url, p.featured_image_alt,
      p.meta_title, p.meta_description,
      p.status, p.published_at, p.reading_time_minutes, p.word_count,
      p.view_count, p.is_featured, p.allow_comments,
      p.created_at, p.updated_at,
      a.id AS author_id, a.name AS author_name, a.slug AS author_slug,
      a.avatar_url AS author_avatar, a.designation AS author_designation,
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM posts p
    LEFT JOIN authors a ON p.author_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_deleted = FALSE AND p.status = 'published'
  `;
  const params = [];

  if (categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(categoryId);
  }
  if (authorId) {
    sql += ' AND p.author_id = ?';
    params.push(authorId);
  }
  if (isFeatured !== undefined) {
    sql += ' AND p.is_featured = ?';
    params.push(isFeatured);
  }
  if (search) {
    sql += ' AND MATCH(p.title, p.excerpt, p.content) AGAINST(? IN NATURAL LANGUAGE MODE)';
    params.push(search);
  }

  // Sort
  const sortMap = {
    'published_at': 'p.published_at ASC',
    '-published_at': 'p.published_at DESC',
    'created_at': 'p.created_at ASC',
    '-created_at': 'p.created_at DESC',
    'title': 'p.title ASC',
    '-title': 'p.title DESC',
    'view_count': 'p.view_count ASC',
    '-view_count': 'p.view_count DESC',
  };
  sql += ` ORDER BY ${sortMap[sort] || 'p.published_at DESC'}`;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return query(sql, params);
}

/**
 * Count published posts with same filters
 */
export async function countPublished({ categoryId, authorId, isFeatured, search }) {
  let sql = `SELECT COUNT(*) AS total FROM posts p WHERE p.is_deleted = FALSE AND p.status = 'published'`;
  const params = [];

  if (categoryId) { sql += ' AND p.category_id = ?'; params.push(categoryId); }
  if (authorId) { sql += ' AND p.author_id = ?'; params.push(authorId); }
  if (isFeatured !== undefined) { sql += ' AND p.is_featured = ?'; params.push(isFeatured); }
  if (search) {
    sql += ' AND MATCH(p.title, p.excerpt, p.content) AGAINST(? IN NATURAL LANGUAGE MODE)';
    params.push(search);
  }

  const result = await queryOne(sql, params);
  return result.total;
}

/**
 * Get all posts (admin view — includes drafts, etc.)
 */
export async function findAll({ limit, offset, status, categoryId, authorId, sort, search }) {
  let sql = `
    SELECT 
      p.*, 
      a.name AS author_name, a.slug AS author_slug,
      c.name AS category_name, c.slug AS category_slug
    FROM posts p
    LEFT JOIN authors a ON p.author_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_deleted = FALSE
  `;
  const params = [];

  if (status) { sql += ' AND p.status = ?'; params.push(status); }
  if (categoryId) { sql += ' AND p.category_id = ?'; params.push(categoryId); }
  if (authorId) { sql += ' AND p.author_id = ?'; params.push(authorId); }
  if (search) {
    sql += ' AND (p.title LIKE ? OR p.excerpt LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const sortMap = {
    'published_at': 'p.published_at ASC',
    '-published_at': 'p.published_at DESC',
    'created_at': 'p.created_at ASC',
    '-created_at': 'p.created_at DESC',
    'title': 'p.title ASC',
    '-title': 'p.title DESC',
  };
  sql += ` ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;
  sql += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return query(sql, params);
}

/**
 * Count all posts (admin)
 */
export async function countAll({ status, categoryId, authorId, search }) {
  let sql = `SELECT COUNT(*) AS total FROM posts p WHERE p.is_deleted = FALSE`;
  const params = [];

  if (status) { sql += ' AND p.status = ?'; params.push(status); }
  if (categoryId) { sql += ' AND p.category_id = ?'; params.push(categoryId); }
  if (authorId) { sql += ' AND p.author_id = ?'; params.push(authorId); }
  if (search) {
    sql += ' AND (p.title LIKE ? OR p.excerpt LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const result = await queryOne(sql, params);
  return result.total;
}

/**
 * Get a single post by slug (public)
 */
export async function findBySlug(slug) {
  const sql = `
    SELECT 
      p.*,
      a.id AS author_id, a.name AS author_name, a.slug AS author_slug,
      a.bio AS author_bio, a.avatar_url AS author_avatar, 
      a.designation AS author_designation, a.social_links AS author_social_links,
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM posts p
    LEFT JOIN authors a ON p.author_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.is_deleted = FALSE AND p.status = 'published'
  `;
  return queryOne(sql, [slug]);
}

/**
 * Get a single post by ID (admin)
 */
export async function findById(id) {
  const sql = `
    SELECT 
      p.*,
      a.name AS author_name, a.slug AS author_slug,
      c.name AS category_name, c.slug AS category_slug
    FROM posts p
    LEFT JOIN authors a ON p.author_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? AND p.is_deleted = FALSE
  `;
  return queryOne(sql, [id]);
}

/**
 * Get tags for a post
 */
export async function findPostTags(postId) {
  const sql = `
    SELECT t.id, t.name, t.slug
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
    ORDER BY t.name
  `;
  return query(sql, [postId]);
}

/**
 * Get related posts based on shared tags and category
 */
export async function findRelated(postId, categoryId, limit = 4) {
  const sql = `
    SELECT DISTINCT
      p.id, p.title, p.slug, p.excerpt, p.featured_image_url,
      p.featured_image_alt, p.published_at, p.reading_time_minutes,
      a.name AS author_name, a.slug AS author_slug,
      c.name AS category_name, c.slug AS category_slug
    FROM posts p
    LEFT JOIN authors a ON p.author_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    WHERE p.id != ? 
      AND p.is_deleted = FALSE 
      AND p.status = 'published'
      AND p.category_id = ?
    ORDER BY p.published_at DESC
    LIMIT ?
  `;
  return query(sql, [postId, categoryId, limit]);
}

/**
 * Create a new post
 */
export async function create(postData) {
  const sql = `
    INSERT INTO posts (
      title, slug, excerpt, content, content_format,
      meta_title, meta_description, og_image_url, canonical_url,
      featured_image_url, featured_image_alt,
      author_id, category_id, status, published_at, scheduled_at,
      reading_time_minutes, word_count, is_featured, allow_comments
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return insert(sql, [
    postData.title, postData.slug, postData.excerpt, postData.content,
    postData.content_format, postData.meta_title, postData.meta_description,
    postData.og_image_url, postData.canonical_url,
    postData.featured_image_url, postData.featured_image_alt,
    postData.author_id, postData.category_id, postData.status,
    postData.published_at, postData.scheduled_at,
    postData.reading_time_minutes, postData.word_count,
    postData.is_featured, postData.allow_comments,
  ]);
}

/**
 * Update an existing post
 */
export async function update(id, postData) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(postData)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const sql = `UPDATE posts SET ${fields.join(', ')} WHERE id = ? AND is_deleted = FALSE`;
  return execute(sql, values);
}

/**
 * Soft delete a post
 */
export async function softDelete(id) {
  const sql = `UPDATE posts SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?`;
  return execute(sql, [id]);
}

/**
 * Increment view count
 */
export async function incrementViewCount(id) {
  const sql = `UPDATE posts SET view_count = view_count + 1 WHERE id = ?`;
  return execute(sql, [id]);
}

/**
 * Set tags for a post (replace all existing tags)
 */
export async function setPostTags(postId, tagIds) {
  // Remove existing tags
  await execute('DELETE FROM post_tags WHERE post_id = ?', [postId]);

  // Insert new tags
  if (tagIds.length > 0) {
    const placeholders = tagIds.map(() => '(?, ?)').join(', ');
    const values = tagIds.flatMap(tagId => [postId, tagId]);
    await execute(`INSERT INTO post_tags (post_id, tag_id) VALUES ${placeholders}`, values);
  }
}

/**
 * Get posts by tag slug (public)
 */
export async function findByTagSlug(tagSlug, { limit, offset }) {
  const sql = `
    SELECT 
      p.id, p.title, p.slug, p.excerpt, p.featured_image_url,
      p.featured_image_alt, p.published_at, p.reading_time_minutes,
      p.view_count, p.is_featured,
      a.name AS author_name, a.slug AS author_slug, a.avatar_url AS author_avatar,
      c.name AS category_name, c.slug AS category_slug
    FROM posts p
    INNER JOIN post_tags pt ON p.id = pt.post_id
    INNER JOIN tags t ON pt.tag_id = t.id
    LEFT JOIN authors a ON p.author_id = a.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE t.slug = ? AND p.is_deleted = FALSE AND p.status = 'published'
    ORDER BY p.published_at DESC
    LIMIT ? OFFSET ?
  `;
  return query(sql, [tagSlug, limit, offset]);
}

/**
 * Count posts by tag slug
 */
export async function countByTagSlug(tagSlug) {
  const sql = `
    SELECT COUNT(*) AS total
    FROM posts p
    INNER JOIN post_tags pt ON p.id = pt.post_id
    INNER JOIN tags t ON pt.tag_id = t.id
    WHERE t.slug = ? AND p.is_deleted = FALSE AND p.status = 'published'
  `;
  const result = await queryOne(sql, [tagSlug]);
  return result.total;
}

/**
 * Get dashboard statistics
 */
export async function getStats() {
  const sql = `
    SELECT
      COUNT(*) AS total_posts,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_count,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
      SUM(view_count) AS total_views
    FROM posts
    WHERE is_deleted = FALSE
  `;
  return queryOne(sql);
}
