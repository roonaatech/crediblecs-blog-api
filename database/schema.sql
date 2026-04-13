-- ============================================
-- CredibleCS Blog Database Schema
-- MySQL 8.0+
-- ============================================
-- Run this script to create the database and all tables.
-- Usage: mysql -u root -p < database/schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS crediblecs_blog
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE crediblecs_blog;

-- ============================================
-- 1. AUTHORS
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  slug          VARCHAR(150)    NOT NULL UNIQUE,
  bio           TEXT            NULL,
  avatar_url    VARCHAR(500)    NULL,
  designation   VARCHAR(150)    NULL,
  social_links  JSON            NULL,
  role          ENUM('admin','editor','author') NOT NULL DEFAULT 'author',
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_authors_slug (slug),
  INDEX idx_authors_role (role)
) ENGINE=InnoDB;

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)    NOT NULL,
  slug          VARCHAR(100)    NOT NULL UNIQUE,
  description   TEXT            NULL,
  parent_id     BIGINT UNSIGNED NULL,
  display_order INT             NOT NULL DEFAULT 0,
  is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_categories_slug (slug),
  INDEX idx_categories_parent (parent_id)
) ENGINE=InnoDB;

-- ============================================
-- 3. TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(80)     NOT NULL,
  slug          VARCHAR(80)     NOT NULL UNIQUE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tags_slug (slug)
) ENGINE=InnoDB;

-- ============================================
-- 4. POSTS (core table)
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(300)    NOT NULL,
  slug            VARCHAR(300)    NOT NULL UNIQUE,
  excerpt         VARCHAR(500)    NULL,
  content         LONGTEXT        NOT NULL,
  content_format  ENUM('html','markdown') NOT NULL DEFAULT 'html',

  -- SEO fields
  meta_title      VARCHAR(200)    NULL,
  meta_description VARCHAR(320)   NULL,
  og_image_url    VARCHAR(500)    NULL,
  canonical_url   VARCHAR(500)    NULL,

  -- Media
  featured_image_url VARCHAR(500) NULL,
  featured_image_alt VARCHAR(300) NULL,

  -- Relationships
  author_id       BIGINT UNSIGNED NOT NULL,
  category_id     BIGINT UNSIGNED NULL,

  -- Status & scheduling
  status          ENUM('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  published_at    TIMESTAMP       NULL,
  scheduled_at    TIMESTAMP       NULL,

  -- Computed/cached fields
  reading_time_minutes SMALLINT  NOT NULL DEFAULT 0,
  word_count      INT             NOT NULL DEFAULT 0,
  view_count      BIGINT UNSIGNED NOT NULL DEFAULT 0,

  -- Flags
  is_featured     BOOLEAN         NOT NULL DEFAULT FALSE,
  allow_comments  BOOLEAN         NOT NULL DEFAULT TRUE,

  -- Soft delete
  is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMP       NULL,

  -- Audit
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (author_id)   REFERENCES authors(id)    ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  INDEX idx_posts_slug (slug),
  INDEX idx_posts_status (status),
  INDEX idx_posts_author (author_id),
  INDEX idx_posts_category (category_id),
  INDEX idx_posts_published (published_at DESC),
  INDEX idx_posts_featured (is_featured, published_at DESC),
  FULLTEXT INDEX ft_posts_search (title, excerpt, content)
) ENGINE=InnoDB;

-- ============================================
-- 5. POST_TAGS (junction table)
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
  post_id     BIGINT UNSIGNED NOT NULL,
  tag_id      BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE,
  INDEX idx_post_tags_tag (tag_id)
) ENGINE=InnoDB;

-- ============================================
-- 6. POST_MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS post_media (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id       BIGINT UNSIGNED NOT NULL,
  file_url      VARCHAR(500)    NOT NULL,
  file_name     VARCHAR(255)    NOT NULL,
  file_type     VARCHAR(50)     NOT NULL,
  file_size     INT UNSIGNED    NOT NULL,
  alt_text      VARCHAR(300)    NULL,
  caption       TEXT            NULL,
  display_order INT             NOT NULL DEFAULT 0,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_media_post (post_id)
) ENGINE=InnoDB;

-- ============================================
-- 7. POST_REVISIONS
-- ============================================
CREATE TABLE IF NOT EXISTS post_revisions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id       BIGINT UNSIGNED NOT NULL,
  title         VARCHAR(300)    NOT NULL,
  content       LONGTEXT        NOT NULL,
  revised_by    BIGINT UNSIGNED NOT NULL,
  revision_note VARCHAR(300)    NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id)    REFERENCES posts(id)   ON DELETE CASCADE,
  FOREIGN KEY (revised_by) REFERENCES authors(id)  ON DELETE RESTRICT,
  INDEX idx_revisions_post (post_id, created_at DESC)
) ENGINE=InnoDB;

-- ============================================
-- 8. COMMENTS (Phase 2 - optional)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id       BIGINT UNSIGNED NOT NULL,
  parent_id     BIGINT UNSIGNED NULL,
  author_name   VARCHAR(150)    NOT NULL,
  author_email  VARCHAR(255)    NOT NULL,
  content       TEXT            NOT NULL,
  status        ENUM('pending','approved','spam','rejected') NOT NULL DEFAULT 'pending',
  ip_address    VARCHAR(45)     NULL,
  is_deleted    BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id)  ON DELETE CASCADE,
  INDEX idx_comments_post (post_id, status),
-- ============================================
-- 9. MEDIA (General library)
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename      VARCHAR(255)    NOT NULL,
  original_name VARCHAR(255)    NOT NULL,
  mime_type     VARCHAR(100)    NOT NULL,
  size          INT UNSIGNED    NOT NULL,
  disk_path     VARCHAR(500)    NOT NULL,
  public_url    VARCHAR(500)    NOT NULL,
  uploaded_by   BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES authors(id) ON DELETE SET NULL,
  INDEX idx_media_uploader (uploaded_by)
) ENGINE=InnoDB;
