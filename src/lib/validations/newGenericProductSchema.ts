import { z } from 'zod';

export const newGenericProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  genericName: z.string().min(1, 'El nombre genérico es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  priority: z
    .string()
    .min(1, 'La prioridad es requerida')
    .refine((val) => /^\d+$/.test(val), {
      message: 'La prioridad debe ser un número entero válido',
    })
    .transform((val) => parseInt(val, 10)),
  manufacturerId: z.string().min(1, 'El ID del fabricante es requerido'),
});
