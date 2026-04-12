# CredibleCS Blog API

Backend REST API service for the CredibleCS Blog, powering the blog section of [crediblecs.com](https://crediblecs.com).

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.x
- **Database:** MySQL 8.0
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Joi
- **Security:** Helmet, CORS, express-rate-limit

## Project Structure

```
crediblecs-blog-api/
├── src/
│   ├── config/          # Database, env, CORS configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, error handling, validation, rate limiting
│   ├── models/          # Data access layer (SQL queries)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helpers (pagination, slugify, reading time)
│   ├── validators/      # Joi validation schemas
│   └── app.js           # Express app setup
├── database/
│   ├── schema.sql       # Full DB schema (8 tables)
│   ├── seed.sql         # Initial data (authors, categories, tags, sample posts)
│   ├── setup.js         # DB setup script
│   ├── seed.js          # Seed data script
│   └── migrations/      # Future migrations
├── uploads/             # Uploaded media (gitignored)
├── .env.example         # Environment template
├── package.json
├── server.js            # Entry point
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- MySQL 8.0+

### 1. Clone and Install

```bash
git clone https://github.com/roonaatech/crediblecs-blog-api.git
cd crediblecs-blog-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secrets
```

### 3. Setup Database

```bash
# Create database and tables
npm run db:setup

# Insert seed data (categories, tags, sample posts)
npm run db:seed

# Or do both at once
npm run db:reset
```

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3001/api/v1`

### 5. Verify

```bash
curl http://localhost:3001/api/v1/health
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/posts` | List published posts (paginated) |
| `GET` | `/api/v1/posts/featured` | Featured posts |
| `GET` | `/api/v1/posts/search?q=...` | Full-text search |
| `GET` | `/api/v1/posts/:slug` | Single post by slug |
| `GET` | `/api/v1/categories` | All categories |
| `GET` | `/api/v1/categories/:slug/posts` | Posts by category |
| `GET` | `/api/v1/tags` | All tags |
| `GET` | `/api/v1/tags/popular` | Popular tags |
| `GET` | `/api/v1/tags/:slug/posts` | Posts by tag |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Login → JWT token |
| `POST` | `/api/v1/auth/refresh` | Refresh token |
| `GET` | `/api/v1/auth/me` | Current user |
| `GET` | `/api/v1/admin/dashboard/stats` | Blog statistics |
| `GET` | `/api/v1/admin/posts` | All posts (inc. drafts) |
| `POST` | `/api/v1/admin/posts` | Create post |
| `PUT` | `/api/v1/admin/posts/:id` | Update post |
| `DELETE` | `/api/v1/admin/posts/:id` | Delete post (soft) |
| `PATCH` | `/api/v1/admin/posts/:id/status` | Change status |
| `POST` | `/api/v1/admin/categories` | Create category |
| `PUT` | `/api/v1/admin/categories/:id` | Update category |
| `DELETE` | `/api/v1/admin/categories/:id` | Delete category |
| `POST` | `/api/v1/admin/tags` | Create tag |
| `DELETE` | `/api/v1/admin/tags/:id` | Delete tag |

### Query Parameters for `/api/v1/posts`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page (max 50) |
| `category_id` | number | - | Filter by category |
| `author_id` | number | - | Filter by author |
| `is_featured` | boolean | - | Featured posts only |
| `sort` | string | `-published_at` | Sort field (prefix `-` for descending) |
| `search` | string | - | Full-text search |

## Database Schema

8 tables with proper indexing and foreign keys:

1. **authors** — Blog post authors with role-based access
2. **categories** — Hierarchical post categories
3. **tags** — Post tags for granular classification
4. **posts** — Core blog content with SEO fields and soft delete
5. **post_tags** — Many-to-many relationship
6. **post_media** — Attached media files
7. **post_revisions** — Content revision history
8. **comments** — Reader comments (Phase 2)

## Default Admin Credentials

After running seed:
- **Email:** akhilesh@crediblecs.com
- **Password:** Admin@123

> ⚠️ Change the password immediately in production!

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
1. Installs production dependencies
2. Creates a deployment package
3. Deploys to the server via SCP
4. Restarts the PM2 process

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Server IP/hostname |
| `SERVER_USER` | SSH username |
| `SERVER_SSH_KEY` | SSH private key |
| `SERVER_PORT` | SSH port (default: 22) |

## Integration with crediblecs-astro

The Astro frontend fetches data from this API at build time (SSG). Add to your Astro `.env`:

```
BLOG_API_URL=https://api.crediblecs.com
```

## License

Proprietary — © Credible Corporate Services Private Limited
