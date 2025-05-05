import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty('La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    newPassword: z
      .string()
      .nonempty('La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z
      .string()
      .nonempty('La confirmación es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
