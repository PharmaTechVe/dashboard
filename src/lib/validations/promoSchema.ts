import { z } from 'zod';

export const promoSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  discount: z
    .number()
    .min(1, 'El descuento mínimo es 1%')
    .max(100, 'El descuento máximo es 100%'),
  expiredAt: z
    .date()
    .min(new Date(), 'La fecha de finalización no puede ser en el pasado'),
});
