import { env } from '../utils/env';

export const Scriblli_ENCRYPTION_KEY = env('NEXT_PRIVATE_ENCRYPTION_KEY');

export const Scriblli_ENCRYPTION_SECONDARY_KEY = env('NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY');

// if (typeof window === 'undefined') {
//   if (!Scriblli_ENCRYPTION_KEY || !Scriblli_ENCRYPTION_SECONDARY_KEY) {
//     throw new Error('Missing Scriblli_ENCRYPTION_KEY or Scriblli_ENCRYPTION_SECONDARY_KEY keys');
//   }

//   if (Scriblli_ENCRYPTION_KEY === Scriblli_ENCRYPTION_SECONDARY_KEY) {
//     throw new Error(
//       'Scriblli_ENCRYPTION_KEY and Scriblli_ENCRYPTION_SECONDARY_KEY cannot be equal',
//     );
//   }
// }

// if (Scriblli_ENCRYPTION_KEY === 'CAFEBABE') {
//   console.warn('*********************************************************************');
//   console.warn('*');
//   console.warn('*');
//   console.warn('Please change the encryption key from the default value of "CAFEBABE"');
//   console.warn('*');
//   console.warn('*');
//   console.warn('*********************************************************************');
// }
