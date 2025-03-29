import { z } from 'zod';

export const newBranchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  latitude: z
    .string()
    .regex(
      /^-?\d+(\.\d{1,6})?$/,
      'La latitud debe ser un número válido con hasta 6 decimales',
    ),
  longitude: z
    .string()
    .regex(
      /^-?\d+(\.\d{1,6})?$/,
      'La longitud debe ser un número válido con hasta 6 decimales',
    ),
  stateId: z.string().min(1, 'Debes seleccionar un estado'),
  cityId: z.string().min(1, 'Debes seleccionar una ciudad'),
});
