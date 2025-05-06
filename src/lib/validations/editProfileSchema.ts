import { z } from 'zod';

export const editProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder los 50 caracteres')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/,
        'El nombre solo puede contener letras y tildes',
      )
      .nonempty('El nombre es obligatorio'),
    lastName: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede exceder los 50 caracteres')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/,
        'El apellido solo puede contener letras y tildes',
      )
      .nonempty('El apellido es obligatorio'),
    phone: z
      .string()
      .optional()
      .refine(
        (value) => value === undefined || /^\+\d{8,15}$/.test(value),
        'El teléfono debe iniciar con + y tener entre 8 y 15 dígitos',
      ),
    birthDate: z
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
  })
  .refine(() => true, {
    message: 'No se han encontrado errores',
  });
