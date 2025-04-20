import { z } from 'zod';

export const newProductPresentationSchema = z.object({
  presentationId: z.string().min(1, 'La presentación es requerida'),
  price: z.number().min(0.01, 'El precio debe ser un número mayor a 0'),
  promoId: z.string().optional().or(z.literal('')),
});
