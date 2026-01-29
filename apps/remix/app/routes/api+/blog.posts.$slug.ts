import { prisma } from '@documenso/prisma';

import type { Route } from './+types/blog.posts.$slug';

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { slug } = params;

  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      category: true,
    },
  });

  if (!post) {
    return Response.json(
      { error: 'Post not found' },
      {
        status: 404,
      },
    );
  }

  // Get related posts from the same category
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: post.categoryId,
      id: {
        not: post.id,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
    },
    take: 3,
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return Response.json(
    {
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
      relatedPosts,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    },
  );
};
