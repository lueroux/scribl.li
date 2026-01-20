import { sValidator } from '@hono/standard-validator';
import type { Prisma } from '@prisma/client';
import { Hono } from 'hono';

import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { APP_DOCUMENT_UPLOAD_SIZE_LIMIT } from '@documenso/lib/constants/app';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { verifyEmbeddingPresignToken } from '@documenso/lib/server-only/embedding-presign/verify-embedding-presign-token';
import { getTeamById } from '@documenso/lib/server-only/team/get-team';
import { putNormalizedPdfFileServerSide } from '@documenso/lib/universal/upload/put-file.server';
import { getPresignPostUrl } from '@documenso/lib/universal/upload/server-actions';
import { prisma } from '@documenso/prisma';

import type { HonoEnv } from '../../router';
import {
  handleEnvelopeItemFileRequest,
  handleEnvelopeItemPageRequest,
  handleEnvelopeItemsMetaRequest,
} from './files.helpers';
import {
  type TGetPresignedPostUrlResponse,
  ZGetEnvelopeItemFileDownloadRequestParamsSchema,
  ZGetEnvelopeItemFileRequestParamsSchema,
  ZGetEnvelopeItemFileRequestQuerySchema,
  ZGetEnvelopeItemFileTokenDownloadRequestParamsSchema,
  ZGetEnvelopeItemFileTokenRequestParamsSchema,
  ZGetEnvelopeItemPageRequestParamsSchema,
  ZGetEnvelopeItemPageRequestQuerySchema,
  ZGetEnvelopeItemPageTokenRequestParamsSchema,
  ZGetEnvelopeMetaRequestParamsSchema,
  ZGetEnvelopeMetaRequestQuerySchema,
  ZGetEnvelopeMetaTokenRequestParamsSchema,
  ZGetPresignedPostUrlRequestSchema,
  ZUploadPdfRequestSchema,
} from './files.types';

export const filesRoute = new Hono<HonoEnv>()
  /**
   * Uploads a document file to the appropriate storage location and creates
   * a document data record.
   */
  .post('/upload-pdf', sValidator('form', ZUploadPdfRequestSchema), async (c) => {
    try {
      const { file } = c.req.valid('form');

      if (!file) {
        return c.json({ error: 'No file provided' }, 400);
      }

      // Todo: (RR7) This is new.
      // Add file size validation.
      // Convert MB to bytes (1 MB = 1024 * 1024 bytes)
      const MAX_FILE_SIZE = APP_DOCUMENT_UPLOAD_SIZE_LIMIT * 1024 * 1024;

      if (file.size > MAX_FILE_SIZE) {
        return c.json({ error: 'File too large' }, 400);
      }

      const result = await putNormalizedPdfFileServerSide(file);

      return c.json(result);
    } catch (error) {
      console.error('Upload failed:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }
  })
  .post('/presigned-post-url', sValidator('json', ZGetPresignedPostUrlRequestSchema), async (c) => {
    const { fileName, contentType } = c.req.valid('json');

    try {
      const { key, url } = await getPresignPostUrl(fileName, contentType);

      return c.json({ key, url } satisfies TGetPresignedPostUrlResponse);
    } catch (err) {
      console.error(err);

      throw new AppError(AppErrorCode.UNKNOWN_ERROR);
    }
  })
  .get(
    '/envelope/:envelopeId/envelopeItem/:envelopeItemId',
    sValidator('param', ZGetEnvelopeItemFileRequestParamsSchema),
    sValidator('query', ZGetEnvelopeItemFileRequestQuerySchema),
    async (c) => {
      const { envelopeId, envelopeItemId } = c.req.valid('param');
      const { token } = c.req.query();

      const session = await getOptionalSession(c);

      let userId = session.user?.id;

      if (token) {
        const presignToken = await verifyEmbeddingPresignToken({
          token,
        }).catch(() => undefined);

        userId = presignToken?.userId;
      }

      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const envelope = await prisma.envelope.findFirst({
        where: {
          id: envelopeId,
        },
        include: {
          envelopeItems: {
            where: {
              id: envelopeItemId,
            },
            include: {
              documentData: true,
            },
          },
        },
      });

      if (!envelope) {
        return c.json({ error: 'Envelope not found' }, 404);
      }

      const [envelopeItem] = envelope.envelopeItems;

      if (!envelopeItem) {
        return c.json({ error: 'Envelope item not found' }, 404);
      }

      const team = await getTeamById({
        userId: userId,
        teamId: envelope.teamId,
      }).catch((error) => {
        console.error(error);

        return null;
      });

      if (!team) {
        return c.json(
          { error: 'User does not have access to the team that this envelope is associated with' },
          403,
        );
      }

      if (!envelopeItem.documentData) {
        return c.json({ error: 'Document data not found' }, 404);
      }

      return await handleEnvelopeItemFileRequest({
        title: envelopeItem.title,
        status: envelope.status,
        documentData: envelopeItem.documentData,
        version: 'signed',
        isDownload: false,
        context: c,
      });
    },
  )
  .get(
    '/envelope/:envelopeId/envelopeItem/:envelopeItemId/download/:version?',
    sValidator('param', ZGetEnvelopeItemFileDownloadRequestParamsSchema),
    async (c) => {
      const { envelopeId, envelopeItemId, version } = c.req.valid('param');

      const session = await getOptionalSession(c);

      if (!session.user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const envelope = await prisma.envelope.findFirst({
        where: {
          id: envelopeId,
        },
        include: {
          envelopeItems: {
            where: {
              id: envelopeItemId,
            },
            include: {
              documentData: true,
            },
          },
        },
      });

      if (!envelope) {
        return c.json({ error: 'Envelope not found' }, 404);
      }

      const [envelopeItem] = envelope.envelopeItems;

      if (!envelopeItem) {
        return c.json({ error: 'Envelope item not found' }, 404);
      }

      const team = await getTeamById({
        userId: session.user.id,
        teamId: envelope.teamId,
      }).catch((error) => {
        console.error(error);

        return null;
      });

      if (!team) {
        return c.json(
          { error: 'User does not have access to the team that this envelope is associated with' },
          403,
        );
      }

      if (!envelopeItem.documentData) {
        return c.json({ error: 'Document data not found' }, 404);
      }

      return await handleEnvelopeItemFileRequest({
        title: envelopeItem.title,
        status: envelope.status,
        documentData: envelopeItem.documentData,
        version,
        isDownload: true,
        context: c,
      });
    },
  )
  .get(
    '/token/:token/envelopeItem/:envelopeItemId',
    sValidator('param', ZGetEnvelopeItemFileTokenRequestParamsSchema),
    async (c) => {
      const { token, envelopeItemId } = c.req.valid('param');

      let envelopeWhereQuery: Prisma.EnvelopeItemWhereUniqueInput = {
        id: envelopeItemId,
        envelope: {
          recipients: {
            some: {
              token,
            },
          },
        },
      };

      if (token.startsWith('qr_')) {
        envelopeWhereQuery = {
          id: envelopeItemId,
          envelope: {
            qrToken: token,
          },
        };
      }

      const envelopeItem = await prisma.envelopeItem.findUnique({
        where: envelopeWhereQuery,
        include: {
          envelope: true,
          documentData: true,
        },
      });

      if (!envelopeItem) {
        return c.json({ error: 'Envelope item not found' }, 404);
      }

      if (!envelopeItem.documentData) {
        return c.json({ error: 'Document data not found' }, 404);
      }

      return await handleEnvelopeItemFileRequest({
        title: envelopeItem.title,
        status: envelopeItem.envelope.status,
        documentData: envelopeItem.documentData,
        version: 'signed',
        isDownload: false,
        context: c,
      });
    },
  )
  .get(
    '/token/:token/envelopeItem/:envelopeItemId/download/:version?',
    sValidator('param', ZGetEnvelopeItemFileTokenDownloadRequestParamsSchema),
    async (c) => {
      const { token, envelopeItemId, version } = c.req.valid('param');

      let envelopeWhereQuery: Prisma.EnvelopeItemWhereUniqueInput = {
        id: envelopeItemId,
        envelope: {
          recipients: {
            some: {
              token,
            },
          },
        },
      };

      if (token.startsWith('qr_')) {
        envelopeWhereQuery = {
          id: envelopeItemId,
          envelope: {
            qrToken: token,
          },
        };
      }

      const envelopeItem = await prisma.envelopeItem.findUnique({
        where: envelopeWhereQuery,
        include: {
          envelope: true,
          documentData: true,
        },
      });

      if (!envelopeItem) {
        return c.json({ error: 'Envelope item not found' }, 404);
      }

      if (!envelopeItem.documentData) {
        return c.json({ error: 'Document data not found' }, 404);
      }

      return await handleEnvelopeItemFileRequest({
        title: envelopeItem.title,
        status: envelopeItem.envelope.status,
        documentData: envelopeItem.documentData,
        version,
        isDownload: true,
        context: c,
      });
    },
  )
  // =============================================
  // PDF Page Image Endpoints (PDF to Image Rendering)
  // =============================================
  /**
   * GET /api/files/envelope/:envelopeId/meta
   * Returns metadata for all envelope items including page counts and dimensions.
   * Used for pre-rendering PDF pages as images.
   */
  .get(
    '/envelope/:envelopeId/meta',
    sValidator('param', ZGetEnvelopeMetaRequestParamsSchema),
    sValidator('query', ZGetEnvelopeMetaRequestQuerySchema),
    async (c) => {
      const { envelopeId } = c.req.valid('param');
      const { presignToken } = c.req.valid('query');

      const session = await getOptionalSession(c);

      // Dummy timeout.
      await new Promise((resolve) => setTimeout(resolve, 250));

      let userId = session.user?.id;

      // Check presignToken if provided
      if (presignToken) {
        const verifiedToken = await verifyEmbeddingPresignToken({
          token: presignToken,
        }).catch(() => undefined);

        userId = verifiedToken?.userId;
      }

      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const envelope = await prisma.envelope.findFirst({
        where: { id: envelopeId },
        include: {
          envelopeItems: {
            include: { documentData: true },
          },
        },
      });

      if (!envelope) {
        return c.json({ error: 'Envelope not found' }, 404);
      }

      // Check team access
      const team = await getTeamById({
        userId,
        teamId: envelope.teamId,
      }).catch(() => null);

      if (!team) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      return await handleEnvelopeItemsMetaRequest({
        c,
        envelopeItems: envelope.envelopeItems,
      });
    },
  )
  /**
   * GET /api/files/token/:token/envelope/:envelopeId/meta
   * Token-based meta endpoint for recipients.
   */
  .get(
    '/token/:token/envelope/:envelopeId/meta',
    sValidator('param', ZGetEnvelopeMetaTokenRequestParamsSchema),
    async (c) => {
      const { token, envelopeId } = c.req.valid('param');

      // Validate token belongs to envelope
      const recipient = await prisma.recipient.findFirst({
        where: {
          token,
          envelope: { id: envelopeId },
        },
        select: {
          envelope: {
            include: {
              envelopeItems: {
                include: { documentData: true },
              },
            },
          },
        },
      });

      if (!recipient) {
        return c.json({ error: 'Invalid token' }, 401);
      }

      return await handleEnvelopeItemsMetaRequest({
        c,
        envelopeItems: recipient.envelope.envelopeItems,
      });
    },
  )
  /**
   * GET /api/files/envelope/:envelopeId/envelopeItem/:envelopeItemId/dataId/:documentDataId/:version/:pageIndex/image.jpeg
   * Returns a single PDF page as a JPEG image.
   */
  .get(
    '/envelope/:envelopeId/envelopeItem/:envelopeItemId/dataId/:documentDataId/:version/:pageIndex/image.jpeg',
    sValidator('param', ZGetEnvelopeItemPageRequestParamsSchema),
    sValidator('query', ZGetEnvelopeItemPageRequestQuerySchema),
    async (c) => {
      const {
        envelopeId,
        envelopeItemId,
        documentDataId: _documentDataId,
        version,
        pageIndex,
      } = c.req.valid('param');

      const { presignToken } = c.req.valid('query');

      const session = await getOptionalSession(c);

      // // Dummy timeout.
      // await new Promise((resolve) => setTimeout(resolve, 250));

      let userId = session.user?.id;

      // Check presignToken if provided
      if (presignToken) {
        const verifiedToken = await verifyEmbeddingPresignToken({
          token: presignToken,
        }).catch(() => undefined);

        userId = verifiedToken?.userId;
      }

      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const envelope = await prisma.envelope.findFirst({
        where: { id: envelopeId },
        include: {
          envelopeItems: {
            where: { id: envelopeItemId },
            include: { documentData: true },
          },
        },
      });

      if (!envelope) {
        return c.json({ error: 'Envelope not found' }, 404);
      }

      const [envelopeItem] = envelope.envelopeItems;

      if (!envelopeItem?.documentData) {
        return c.json({ error: 'Envelope item not found' }, 404);
      }

      // Check team access
      const team = await getTeamById({
        userId,
        teamId: envelope.teamId,
      }).catch(() => null);

      if (!team) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      return await handleEnvelopeItemPageRequest({
        c,
        envelopeItem,
        version,
        pageIndex,
      });
    },
  )
  /**
   * GET /api/files/token/:token/envelope/:envelopeId/envelopeItem/:envelopeItemId/dataId/:documentDataId/:version/:pageIndex/image.jpeg
   * Token-based page image endpoint for recipients.
   */
  .get(
    '/token/:token/envelope/:envelopeId/envelopeItem/:envelopeItemId/dataId/:documentDataId/:version/:pageIndex/image.jpeg',
    sValidator('param', ZGetEnvelopeItemPageTokenRequestParamsSchema),
    async (c) => {
      const {
        token,
        envelopeId,
        envelopeItemId,
        documentDataId: _documentDataId,
        version,
        pageIndex,
      } = c.req.valid('param');

      // Dummy timeout.
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Validate token belongs to envelope
      const recipient = await prisma.recipient.findFirst({
        where: {
          token,
          envelope: { id: envelopeId },
        },
        include: {
          envelope: {
            include: {
              envelopeItems: {
                where: { id: envelopeItemId },
                include: { documentData: true },
              },
            },
          },
        },
      });

      if (!recipient) {
        return c.json({ error: 'Invalid token' }, 401);
      }

      const envelope = recipient.envelope;
      const [envelopeItem] = envelope.envelopeItems;

      if (!envelopeItem?.documentData) {
        return c.json({ error: 'Envelope item not found' }, 404);
      }

      return await handleEnvelopeItemPageRequest({
        c,
        envelopeItem,
        version,
        pageIndex,
      });
    },
  );
