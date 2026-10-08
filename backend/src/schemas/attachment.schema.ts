import { z } from 'zod';

export const attachmentBodySchema = z.object({
  related_to: z.enum(['LOGBOOK', 'INCIDENT', 'MAINTENANCE'], {
    errorMap: () => ({ message: 'related_to harus bernilai LOGBOOK, INCIDENT, atau MAINTENANCE' }),
  }),
  related_id: z.coerce.number().int().positive('related_id harus berupa bilangan bulat positif'),
});

export const createAttachmentSchema = z.object({
  body: attachmentBodySchema,
});

export const attachmentIdParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type CreateAttachmentInput = z.infer<typeof attachmentBodySchema>;
