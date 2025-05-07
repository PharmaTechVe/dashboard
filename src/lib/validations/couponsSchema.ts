import { z } from 'zod';

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder los 20 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'El código solo puede contener letras y números'),

  discount: z
    .number()
    .min(1, 'El descuento mínimo es 1%')
    .max(100, 'El descuento máximo es 100%'),

  minPurchase: z
    .number()
    .min(0, 'La compra mínima no puede ser negativa')
    .int('La compra mínima debe ser un número entero'),

  maxUses: z
    .number()
    .min(1, 'Debe permitir al menos 1 uso')
    .max(1000, 'El máximo de usos no puede exceder 1000'),

  expirationDate: z
    .date()
    .min(new Date(), 'La fecha de expiración debe ser futura'),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
