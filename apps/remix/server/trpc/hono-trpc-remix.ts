import { trpcServer } from '@hono/trpc-server';

import { createTrpcContext } from '@Scriblli/trpc/server/context';
import { appRouter } from '@Scriblli/trpc/server/router';
import { handleTrpcRouterError } from '@Scriblli/trpc/utils/trpc-error-handler';

/**
 * Trpc server for internal routes like /api/trpc/*
 */
export const reactRouterTrpcServer = trpcServer({
  router: appRouter,
  endpoint: '/api/trpc',
  createContext: async (_, c) => createTrpcContext({ c, requestSource: 'app' }),
  onError: (opts) => handleTrpcRouterError(opts, 'trpc'),
});
