'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import Input from '@/components/Input/Input';
import Button from '@/components/Button';
import { updatePasswordSchema } from '@/lib/validations/updatePasswordSchema';

export default function SecurityPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = updatePasswordSchema.safeParse({
      password: currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors({
        currentPassword: fe.password?.[0] ?? '',
        newPassword: fe.newPassword?.[0] ?? '',
        confirmPassword: fe.confirmPassword?.[0] ?? '',
      });
      return;
    }

    try {
      if (!token) throw new Error('No token');
      await api.auth.updateCurrentPassword(currentPassword, newPassword, token);
      toast.success('Contraseña actualizada');
      router.push('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar la contraseña');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <Input
        label="Contraseña Actual"
        type="password"
        placeholder="Ingresa tu contraseña"
        showPasswordToggle
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        helperText={errors.currentPassword}
        borderColor="#E7E7E6"
      />

      <Input
        label="Contraseña Nueva"
        type="password"
        placeholder="Ingresa tu nueva contraseña"
        showPasswordToggle
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        helperText={errors.newPassword}
        borderColor="#E7E7E6"
      />

      <Input
        label="Confirmar Contraseña"
        type="password"
        placeholder="Confirma tu nueva contraseña"
        showPasswordToggle
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        helperText={errors.confirmPassword}
        borderColor="#E7E7E6"
      />

      <div className="flex justify-end">
        <Button variant="submit">Cambiar Contraseña</Button>
      </div>
    </form>
  );
}
