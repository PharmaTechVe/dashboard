import { z } from 'zod';

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder los 50 caracteres')
      .regex(/^[a-zA-Z\s]+$/, 'El nombre solo puede contener letras')
      .nonempty('El nombre es obligatorio'),
    apellido: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede exceder los 50 caracteres')
      .regex(/^[a-zA-Z\s]+$/, 'El apellido solo puede contener letras')
      .nonempty('El apellido es obligatorio'),
    email: z
      .string()
      .nonempty('El email es obligatorio')
      .email('Formato de email inválido'),
    cedula: z
      .string()
      .nonempty('La cédula es obligatoria')
      .regex(/^\d+$/, 'La cédula debe contener solo números'),
    telefono: z
      .string()
      .transform((value) => (value?.trim() === '' ? null : value))
      .nullable()
      .refine(
        (value) => value === null || /^\+\d{8,15}$/.test(value),
        'El teléfono debe iniciar con + y tener entre 8 y 15 dígitos',
      ),
    fechaNacimiento: z
      .string()
      .nonempty('La fecha de nacimiento es obligatoria')
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Formato de fecha inválido (debe ser yyyy-mm-dd)',
      )
      .refine(
        (fecha) => {
          const [year, month, day] = fecha.split('-').map(Number);
          const fechaDate = new Date(year, month - 1, day);
          if (isNaN(fechaDate.getTime())) return false;
          const today = new Date();
          const minAllowedDate = new Date(
            today.getFullYear() - 14,
            today.getMonth(),
            today.getDate(),
          );
          return fechaDate <= minAllowedDate;
        },
        {
          message: 'Debes tener al menos 14 años',
        },
      ),
    genero: z
      .string()
      .transform((value) => (value?.trim() === '' ? null : value))
      .nullable()
      .refine(
        (value) => value === null || value === 'hombre' || value === 'mujer',
        'Selecciona un género',
      ),
    // Campos de contraseña opcionales
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe tener al menos una letra minúscula')
      .regex(/\d/, 'Debe tener al menos un número')
      .regex(/[!@#$%^&*]/, 'Debe tener al menos un símbolo especial (!@#$%^&*)')
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Si se envía alguna contraseña, se deben enviar ambas y deben coincidir
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    },
  );
