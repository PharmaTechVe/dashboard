import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty('La contraseña actual es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(255, 'La contraseña no puede exceder 255 caracteres'),

    newPassword: z
      .string()
      .nonempty('La contraseña es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(255, 'La contraseña no puede exceder 255 caracteres'),

    confirmPassword: z
      .string()
      .nonempty('La confirmación de contraseña es obligatoria')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(255, 'La contraseña no puede exceder 255 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
