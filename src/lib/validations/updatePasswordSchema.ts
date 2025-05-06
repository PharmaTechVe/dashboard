import { z } from 'zod';

export const updatePasswordSchema = z
  .object({
    password: z.string().nonempty('La contraseña es obligatoria'),
    newPassword: z
      .string()
      .min(8, 'La confirmación debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe tener al menos una letra minúscula')
      .regex(/\d/, 'Debe tener al menos un número')
      .regex(/[!@#$%^&*]/, 'Debe tener al menos un símbolo especial (!@#$%^&*)')
      .nonempty('La confirmación de contraseña es obligatoria'),
    confirmPassword: z
      .string()
      .min(8, 'La confirmación debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe tener al menos una letra minúscula')
      .regex(/\d/, 'Debe tener al menos un número')
      .regex(/[!@#$%^&*]/, 'Debe tener al menos un símbolo especial (!@#$%^&*)')
      .nonempty('La confirmación de contraseña es obligatoria'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
