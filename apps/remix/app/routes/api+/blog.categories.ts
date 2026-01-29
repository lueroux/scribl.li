import { prisma } from '@documenso/prisma';

import type { Route } from './+types/blog.categories';

export const loader = async ({ request: _request }: Route.LoaderArgs) => {
  const categories = await prisma.blogCategory.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: 'PUBLISHED',
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return Response.json(
    {
      categories: categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        count: category._count.posts,
      })),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=1200',
      },
    },
  );
};
