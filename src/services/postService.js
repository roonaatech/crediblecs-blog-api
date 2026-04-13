import * as postModel from '../models/postModel.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { calculateReadingTime } from '../utils/readingTime.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import axios from 'axios';

/**
 * Trigger frontend rebuild via webhook
 */
async function triggerFrontendRebuild() {
  const webhookUrl = process.env.FRONTEND_REBUILD_WEBHOOK;
  if (!webhookUrl) return;

  try {
    console.log('🚀 Triggering frontend rebuild...');
    await axios.post(webhookUrl, { event_type: 'blog_update' });
    console.log('✅ Rebuild trigger sent successfully');
  } catch (err) {
    console.error('❌ Failed to trigger frontend rebuild:', err.message);
  }
}

/**
 * Post Service - Business logic for blog posts
 */

/**
 * Get published posts (public)
 */
export async function getPublishedPosts(queryParams) {
  const { page, limit, offset } = parsePagination(queryParams);

  const filters = {
    categoryId: queryParams.category_id,
    authorId: queryParams.author_id,
    isFeatured: queryParams.is_featured,
    sort: queryParams.sort || '-published_at',
    search: queryParams.search,
  };

  const [posts, total] = await Promise.all([
    postModel.findPublished({ limit, offset, ...filters }),
    postModel.countPublished(filters),
  ]);

  // Attach tags to each post
  const postsWithTags = await Promise.all(
    posts.map(async (post) => {
      const tags = await postModel.findPostTags(post.id);
      return { ...post, tags };
    })
  );

  return {
    posts: postsWithTags,
    pagination: buildPagination(total, page, limit),
  };
}

/**
 * Get all posts (admin)
 */
export async function getAllPosts(queryParams) {
  const { page, limit, offset } = parsePagination(queryParams);

  const filters = {
    status: queryParams.status,
    categoryId: queryParams.category_id,
    authorId: queryParams.author_id,
    sort: queryParams.sort || '-created_at',
    search: queryParams.search,
  };

  const [posts, total] = await Promise.all([
    postModel.findAll({ limit, offset, ...filters }),
    postModel.countAll(filters),
  ]);

  const postsWithTags = await Promise.all(
    posts.map(async (post) => {
      const tags = await postModel.findPostTags(post.id);
      return { ...post, tags };
    })
  );

  return {
    posts: postsWithTags,
    pagination: buildPagination(total, page, limit),
  };
}

/**
 * Get a single post by slug (public)
 */
export async function getPostBySlug(slug) {
  const post = await postModel.findBySlug(slug);

  if (!post) {
    throw Object.assign(new Error('Blog post not found.'), { statusCode: 404 });
  }

  // Increment view count (fire and forget)
  postModel.incrementViewCount(post.id).catch(() => {});

  // Get tags
  const tags = await postModel.findPostTags(post.id);

  // Get related posts
  const related = await postModel.findRelated(post.id, post.category_id);

  return {
    ...post,
    tags,
    related_posts: related,
  };
}

/**
 * Get a single post by ID (admin)
 */
export async function getPostById(id) {
  const post = await postModel.findById(id);

  if (!post) {
    throw Object.assign(new Error('Blog post not found.'), { statusCode: 404 });
  }

  const tags = await postModel.findPostTags(post.id);
  return { ...post, tags };
}

/**
 * Create a new blog post
 */
export async function createPost(data, authorId) {
  // Generate unique slug from title
  const slug = await generateUniqueSlug(data.title, 'posts');

  // Calculate reading time
  const { minutes, words } = calculateReadingTime(data.content);

  // Set published_at if publishing immediately
  const publishedAt = data.status === 'published' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

  const postId = await postModel.create({
    title: data.title,
    slug,
    excerpt: data.excerpt || null,
    content: data.content,
    content_format: data.content_format || 'html',
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    og_image_url: data.og_image_url || null,
    canonical_url: data.canonical_url || null,
    featured_image_url: data.featured_image_url || null,
    featured_image_alt: data.featured_image_alt || null,
    author_id: authorId,
    category_id: data.category_id || null,
    status: data.status || 'draft',
    published_at: publishedAt,
    scheduled_at: data.scheduled_at || null,
    reading_time_minutes: minutes,
    word_count: words,
    is_featured: data.is_featured || false,
    allow_comments: data.allow_comments !== false,
  });

  // Set tags if provided
  if (data.tag_ids && data.tag_ids.length > 0) {
    await postModel.setPostTags(postId, data.tag_ids);
  }

  const post = await getPostById(postId);
  
  // Trigger rebuild if published
  if (post.status === 'published') {
    triggerFrontendRebuild();
  }

  return post;
}

/**
 * Update an existing blog post
 */
export async function updatePost(id, data) {
  const existingPost = await postModel.findById(id);
  if (!existingPost) {
    throw Object.assign(new Error('Blog post not found.'), { statusCode: 404 });
  }

  const updateData = {};

  // Handle title/slug change
  if (data.title && data.title !== existingPost.title) {
    updateData.title = data.title;
    updateData.slug = await generateUniqueSlug(data.title, 'posts', id);
  }

  // Handle content change → recalculate reading time
  if (data.content) {
    updateData.content = data.content;
    const { minutes, words } = calculateReadingTime(data.content);
    updateData.reading_time_minutes = minutes;
    updateData.word_count = words;
  }

  // Handle status change
  if (data.status) {
    updateData.status = data.status;
    if (data.status === 'published' && !existingPost.published_at) {
      updateData.published_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  // Copy other updatable fields
  const directFields = [
    'excerpt', 'content_format', 'meta_title', 'meta_description',
    'og_image_url', 'canonical_url', 'featured_image_url', 'featured_image_alt',
    'category_id', 'scheduled_at', 'is_featured', 'allow_comments',
  ];
  for (const field of directFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length > 0) {
    await postModel.update(id, updateData);
  }

  // Update tags if provided
  if (data.tag_ids !== undefined) {
    await postModel.setPostTags(id, data.tag_ids);
  }

  const updatedPost = await getPostById(id);

  // Trigger rebuild if published or was published
  if (updatedPost.status === 'published' || existingPost.status === 'published') {
    triggerFrontendRebuild();
  }

  return updatedPost;
}

/**
 * Soft delete a post
 */
export async function deletePost(id) {
  const post = await postModel.findById(id);
  if (!post) {
    throw Object.assign(new Error('Blog post not found.'), { statusCode: 404 });
  }

  await postModel.softDelete(id);
  
  // Trigger rebuild if it was published
  if (post.status === 'published') {
    triggerFrontendRebuild();
  }

  return { message: 'Post deleted successfully.' };
}

/**
 * Update post status
 */
export async function updatePostStatus(id, status, scheduledAt) {
  const post = await postModel.findById(id);
  if (!post) {
    throw Object.assign(new Error('Blog post not found.'), { statusCode: 404 });
  }

  const updateData = { status };

  if (status === 'published' && !post.published_at) {
    updateData.published_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
  if (status === 'scheduled' && scheduledAt) {
    updateData.scheduled_at = scheduledAt;
  }

  await postModel.update(id, updateData);
  
  // Trigger rebuild
  triggerFrontendRebuild();

  return getPostById(id);
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(limit = 5) {
  const posts = await postModel.findPublished({
    limit,
    offset: 0,
    isFeatured: true,
    sort: '-published_at',
  });

  const postsWithTags = await Promise.all(
    posts.map(async (post) => {
      const tags = await postModel.findPostTags(post.id);
      return { ...post, tags };
    })
  );

  return postsWithTags;
}

/**
 * Get posts by tag slug (public)
 */
export async function getPostsByTag(tagSlug, queryParams) {
  const { page, limit, offset } = parsePagination(queryParams);

  const [posts, total] = await Promise.all([
    postModel.findByTagSlug(tagSlug, { limit, offset }),
    postModel.countByTagSlug(tagSlug),
  ]);

  return {
    posts,
    pagination: buildPagination(total, page, limit),
  };
}

/**
 * Get blog dashboard statistics
 */
export async function getDashboardStats() {
  return postModel.getStats();
}
