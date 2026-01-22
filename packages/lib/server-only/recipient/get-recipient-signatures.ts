import { prisma } from '@Scriblli/prisma';

export type GetRecipientSignaturesOptions = {
  recipientId: number;
};

export const getRecipientSignatures = async ({ recipientId }: GetRecipientSignaturesOptions) => {
  return await prisma.signature.findMany({
    where: {
      field: {
        recipientId,
      },
    },
  });
};
