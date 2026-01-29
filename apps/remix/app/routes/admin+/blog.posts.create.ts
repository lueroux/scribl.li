import { redirect } from 'react-router';
import { z } from 'zod';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { isAdmin } from '@documenso/lib/utils/is-admin';
import { prisma } from '@documenso/prisma';

import type { Route } from './+types/blog.posts.create';

const ZCreateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  authorEmail: z.string().email().optional(),
  featured: z.boolean().default(false),
  imageUrl: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { user } = await getSession(request);

  if (!user || !isAdmin(user)) {
    throw redirect('/');
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const data = ZCreateBlogPostSchema.parse(body);

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      return Response.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }

    // Calculate read time if not provided
    const wordCount = data.content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId,
        author: data.author,
        authorEmail: data.authorEmail,
        featured: data.featured,
        imageUrl: data.imageUrl || null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        status: data.status,
        readTime,
      },
      include: {
        category: true,
      },
    });

    return Response.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        publishedAt: post.publishedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    console.error('Error creating blog post:', error);
    return Response.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
};
