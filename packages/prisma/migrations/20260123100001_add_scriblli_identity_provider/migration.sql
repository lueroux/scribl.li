-- Add Scriblli to IdentityProvider enum
-- This must be committed before the value can be used
ALTER TYPE "IdentityProvider" ADD VALUE IF NOT EXISTS 'Scriblli';
