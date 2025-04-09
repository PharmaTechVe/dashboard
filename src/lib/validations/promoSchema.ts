import { z } from 'zod';

export const promoSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    discount: z
      .number()
      .min(1, 'Debe ser al menos 1%')
      .max(100, 'No puede exceder 100%'),
    startAt: z.date({ required_error: 'La fecha de inicio es requerida' }),
    expiredAt: z.date({
      required_error: 'La fecha de finalización es requerida',
    }),
  })
  .superRefine((data: { startAt: Date; expiredAt: Date }, ctx) => {
    if (data.expiredAt <= data.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiredAt'],
        message: 'La fecha de finalización debe ser posterior a la de inicio',
      });
    }
  });
