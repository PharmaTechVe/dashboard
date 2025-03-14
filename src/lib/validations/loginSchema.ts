import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('El email es obligatorio')
    .email('Formato de email inválido'),
  password: z
    .string()
    .nonempty('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
