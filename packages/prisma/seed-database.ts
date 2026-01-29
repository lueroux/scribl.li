import fs from 'node:fs';
import path from 'node:path';

import { seedBlogCategories, seedBlogPosts } from './seed/blog-categories.seed';

const seedDatabase = async () => {
  // Seed blog categories and posts first
  try {
    await seedBlogCategories();
    await seedBlogPosts();
  } catch (e) {
    console.log('[SEEDING]: Blog seed failed');
    console.error(e);
  }

  // Seed other database items
  const files = fs.readdirSync(path.join(__dirname, './seed'));

  for (const file of files) {
    const stat = fs.statSync(path.join(__dirname, './seed', file));

    if (stat.isFile()) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path.join(__dirname, './seed', file));

      if ('seedDatabase' in mod && typeof mod.seedDatabase === 'function') {
        console.log(`[SEEDING]: ${file}`);

        try {
          await mod.seedDatabase();
        } catch (e) {
          console.log(`[SEEDING]: Seed failed for ${file}`);
          console.error(e);
        }
      }
    }
  }
};

seedDatabase()
  .then(() => {
    console.log('Database seeded');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
