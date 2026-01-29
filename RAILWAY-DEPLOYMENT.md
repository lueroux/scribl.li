# Railway Deployment Guide - Blog Integration

This document explains how the blog database migrations and seeding are automatically handled on Railway deployment.

## Automatic Migration & Seeding

The blog tables and initial data are automatically created when deploying to Railway through the following process:

### 1. Database Migration

The migration file `packages/prisma/migrations/20260129135100_add_blog_tables.sql` contains:
- `BlogCategory` table creation
- `BlogPost` table creation
- `BlogPostStatus` enum
- All necessary indexes and foreign keys

This migration runs automatically during deployment via the `start.sh` script:
```bash
npx prisma migrate deploy --schema ../../packages/prisma/schema.prisma
```

### 2. Database Seeding

After migrations complete, the seeding process runs automatically:
```bash
npm run prisma:seed
```

This seeds:
- **7 Blog Categories:**
  - Security
  - Efficiency
  - Integration
  - Legal
  - Remote Work
  - Analytics
  - Industry Trends

- **3 Sample Blog Posts:**
  - "The Future of Digital Signatures: Trends to Watch in 2026" (Featured)
  - "How Secure Are Electronic Signatures? A Deep Dive"
  - "5 Ways E-Signatures Transform Your Business Workflow"

### 3. Deployment Flow

```
Railway Deploy
    ↓
Docker Build (Dockerfile)
    ↓
Container Start (start.sh)
    ↓
Run Migrations (prisma migrate deploy)
    ↓
Seed Database (npm run prisma:seed)
    ↓
Start Server
```

## Files Involved

1. **Migration File:**
   - `packages/prisma/migrations/20260129135100_add_blog_tables.sql`

2. **Seed Files:**
   - `packages/prisma/seed/blog-categories.seed.ts` - Categories and sample posts
   - `packages/prisma/seed-database.ts` - Main seed orchestrator

3. **Deployment Scripts:**
   - `docker/start.sh` - Runs migrations and seeding on container start
   - `docker/Dockerfile` - Builds the container with Prisma schema and migrations

4. **Configuration:**
   - `packages/prisma/package.json` - Defines seed script
   - `packages/prisma/schema.prisma` - Contains BlogCategory and BlogPost models

## Verifying Deployment

After deployment, verify the blog integration:

1. **Check API Endpoints:**
   ```bash
   curl https://scribl.li/api/blog/posts
   curl https://scribl.li/api/blog/categories
   curl https://scribl.li/api/blog/featured
   ```

2. **Check Database:**
   - Categories should have 7 entries
   - Posts should have 3 sample entries
   - All posts should be in PUBLISHED status

3. **Check Landing Page:**
   - Visit https://scriblli.com/blog.html
   - Should display the featured post and recent posts
   - Categories should show correct counts

## Manual Operations

If you need to manually run migrations or seeding:

### Run Migrations Only:
```bash
cd packages/prisma
npx prisma migrate deploy
```

### Run Seeding Only:
```bash
cd packages/prisma
npm run prisma:seed
```

### Reset and Reseed (Development Only):
```bash
cd packages/prisma
npx prisma migrate reset
```

## Troubleshooting

### Seeding Fails
- Check that migrations completed successfully first
- Verify DATABASE_URL is set correctly
- Check Railway logs for specific error messages

### Duplicate Key Errors
- Seeding uses `upsert` to prevent duplicates
- Safe to run multiple times
- Will update existing records instead of creating duplicates

### Missing Blog Posts
- Ensure categories were seeded first (they're a dependency)
- Check that the seed script completed without errors
- Verify the `status` field is set to 'PUBLISHED'

## Adding New Blog Posts

After deployment, you can add new blog posts through:

1. **Admin Panel:**
   - Navigate to `/admin/blog/posts/create`
   - Must be logged in as admin user

2. **API:**
   ```bash
   POST https://scribl.li/admin/blog/posts/create
   Authorization: Bearer <admin-token>
   ```

3. **Direct Database:**
   - Connect to Railway database
   - Insert into BlogPost table
   - Ensure status is 'PUBLISHED' for visibility

## Environment Variables

No additional environment variables are required for blog functionality. The blog uses the existing database connection configured via:
- `NEXT_PRIVATE_DATABASE_URL`
- `NEXT_PRIVATE_DIRECT_DATABASE_URL`

## Notes

- Seeding is idempotent - safe to run multiple times
- Sample posts are created with realistic content
- All timestamps use UTC
- Blog posts support Markdown content
- Images are optional (uses placeholder icons if not provided)
