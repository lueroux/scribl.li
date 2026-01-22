/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('@Scriblli/tailwind-config');
const path = require('path');

module.exports = {
  ...baseConfig,
  content: [
    ...baseConfig.content,
    './app/**/*.{ts,tsx}',
    `${path.join(require.resolve('@Scriblli/ui'), '..')}/components/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@Scriblli/ui'), '..')}/icons/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@Scriblli/ui'), '..')}/lib/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@Scriblli/ui'), '..')}/primitives/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@Scriblli/email'), '..')}/templates/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@Scriblli/email'), '..')}/template-components/**/*.{ts,tsx}`,
    `${path.join(require.resolve('@Scriblli/email'), '..')}/providers/**/*.{ts,tsx}`,
  ],
};
