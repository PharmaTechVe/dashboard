import { z } from 'zod';

export const newBranchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),

  latitude: z
    .string()
    .min(1, 'La latitud es requerida')
    .refine((val) => /^-?\d+(\.\d{1,6})?$/.test(val), {
      message:
        'La latitud debe ser un número válido, con punto como separador decimal y máximo 6 decimales',
    })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= -90 && val <= 90, {
      message: 'La latitud debe estar entre -90 y 90 grados',
    }),

  longitude: z
    .string()
    .min(1, 'La longitud es requerida')
    .refine((val) => /^-?\d+(\.\d{1,6})?$/.test(val), {
      message:
        'La longitud debe ser un número válido, con punto como separador decimal y máximo 6 decimales',
    })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= -180 && val <= 180, {
      message: 'La longitud debe estar entre -180 y 180 grados',
    }),

  stateId: z.string().min(1, 'Debes seleccionar un estado'),
  cityId: z.string().min(1, 'Debes seleccionar una ciudad'),
});
