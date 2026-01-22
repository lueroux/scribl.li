import type { NextConfig } from 'next';

import nextra from 'nextra';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@Scriblli/assets',
    '@Scriblli/lib',
    '@Scriblli/tailwind-config',
    '@Scriblli/trpc',
    '@Scriblli/ui',
  ],
};

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  codeHighlight: true,
});

export default withNextra(nextConfig);
