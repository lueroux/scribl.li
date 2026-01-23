-- Rename IdentityProvider enum value from DOCUMENSO to Scriblli
-- First add the new value, then update records, then remove old value

-- Add new enum value if it doesn't exist
ALTER TYPE "IdentityProvider" ADD VALUE IF NOT EXISTS 'Scriblli';

-- Update all existing records from DOCUMENSO to Scriblli
UPDATE "User" SET "identityProvider" = 'Scriblli' WHERE "identityProvider" = 'DOCUMENSO';

-- Note: PostgreSQL doesn't support removing enum values directly.
-- The old 'DOCUMENSO' value will remain in the enum but won't be used.
-- This is safe as Prisma will only use values defined in the schema.
