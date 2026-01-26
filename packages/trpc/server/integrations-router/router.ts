import { router } from '../trpc';
import { pipedriveRouter } from './pipedrive';

export const integrationsRouter = router({
  pipedrive: pipedriveRouter,
});
