import { z } from 'zod';

export const newPresentationSchema = z.object({
  name: z.string().min(1, 'El nombre de la presentación es requerido'),
  description: z.string().optional(), // o .min(1, 'Descripción requerida') si es obligatoria
  quantity: z
    .string()
    .min(1, 'La cantidad es requerida')
    .refine((val) => /^\d+(\.\d+)?$/.test(val), {
      message: 'La cantidad debe ser un número válido',
    })
    .transform((val) => parseFloat(val)),
  measurementUnit: z.string().min(1, 'La unidad de medida es requerida'),
});
