import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(255, 'La descripción no puede exceder 500 caracteres'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
