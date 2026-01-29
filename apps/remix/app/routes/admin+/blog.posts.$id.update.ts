import { redirect } from 'react-router';
import { z } from 'zod';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { isAdmin } from '@documenso/lib/utils/is-admin';
import { prisma } from '@documenso/prisma';

import type { Route } from './+types/blog.posts.$id.update';

const ZUpdateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required').optional(),
  categoryId: z.string().optional().nullable(),
  author: z.string().min(1, 'Author is required').optional(),
  authorEmail: z.string().email().optional().nullable(),
  featured: z.boolean().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { user } = await getSession(request);

  if (!user || !isAdmin(user)) {
    throw redirect('/');
  }

  if (request.method !== 'PUT' && request.method !== 'PATCH') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const data = ZUpdateBlogPostSchema.parse(body);

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if slug is being changed and if it conflicts
    if (data.slug && data.slug !== existingPost.slug) {
      const slugConflict = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        return Response.json({ error: 'A post with this slug already exists' }, { status: 400 });
      }
    }

    // Calculate read time if content is being updated
    let readTime = existingPost.readTime;
    if (data.content) {
      const wordCount = data.content.trim().split(/\s+/).length;
      readTime = Math.ceil(wordCount / 200);
    }

    const updateData: Partial<typeof data> & { readTime: number } = {
      ...data,
      readTime,
    };

    // Handle nullable fields
    if (data.imageUrl === '') {
      updateData.imageUrl = null;
    }
    if (data.publishedAt === null) {
      updateData.publishedAt = null;
    } else if (data.publishedAt) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
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
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    console.error('Error updating blog post:', error);
    return Response.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
};
