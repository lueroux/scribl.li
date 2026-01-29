import { prisma } from '@documenso/prisma';

import type { Route } from './+types/blog.featured';

export const loader = async ({ request: _request }: Route.LoaderArgs) => {
  const featuredPost = await prisma.blogPost.findFirst({
    where: {
      status: 'PUBLISHED',
      featured: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  if (!featuredPost) {
    return Response.json(
      { error: 'No featured post found' },
      {
        status: 404,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        },
      },
    );
  }

  return Response.json(
    {
      id: featuredPost.id,
      title: featuredPost.title,
      slug: featuredPost.slug,
      excerpt: featuredPost.excerpt,
      content: featuredPost.content,
      category: featuredPost.category?.name || null,
      author: featuredPost.author,
      authorEmail: featuredPost.authorEmail,
      publishedAt: featuredPost.publishedAt,
      updatedAt: featuredPost.updatedAt,
      readTime: featuredPost.readTime,
      featured: featuredPost.featured,
      image: featuredPost.imageUrl,
      metaTitle: featuredPost.metaTitle,
      metaDescription: featuredPost.metaDescription,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    },
  );
};
