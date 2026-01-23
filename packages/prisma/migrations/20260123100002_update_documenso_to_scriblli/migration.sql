-- Update all existing records from DOCUMENSO to Scriblli
UPDATE "User" SET "identityProvider" = 'Scriblli' WHERE "identityProvider" = 'DOCUMENSO';
