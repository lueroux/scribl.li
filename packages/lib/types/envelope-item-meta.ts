import { z } from 'zod';

export const ZEnvelopeItemMetaSchema = z.object({
  // Could store other things such as PDF size, etc here.
  pages: z
    .object({
      width: z.number().describe('Unscaled PDF page width'),
      height: z.number().describe('Unscaled PDF page height'),
    })
    .array(),
});

export type TEnvelopeItemMeta = z.infer<typeof ZEnvelopeItemMetaSchema>;
