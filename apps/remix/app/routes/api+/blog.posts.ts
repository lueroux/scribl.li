import { prisma } from '@documenso/prisma';

import type { Route } from './+types/blog.posts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');

  const where = {
    status: 'PUBLISHED' as const,
    ...(category && { category: { slug: category } }),
    ...(featured === 'true' && { featured: true }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return Response.json(
    {
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category?.name || null,
        author: post.author,
        authorEmail: post.authorEmail,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        readTime: post.readTime,
        featured: post.featured,
        image: post.imageUrl,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
      })),
      total,
      limit,
      offset,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    },
  );
};
