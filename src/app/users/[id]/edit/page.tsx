'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { registerSchema } from '@/lib/validations/registerSchema';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

enum UserGender {
  MALE = 'm',
  FEMALE = 'f',
}

enum UserRole {
  ADMIN = 'admin',
  BRANCH_ADMIN = 'branch_admin',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.BRANCH_ADMIN]: 'Administrador de Sucursal',
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.DELIVERY]: 'Repartidor',
};

const formatDate = (dateStr: string): string => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token } = useAuth();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [gender, setGender] = useState<UserGender | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchUser = useCallback(async () => {
    if (!token || typeof id !== 'string') return;

    try {
      const user = await api.user.getProfile(id, token);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setDocumentId(user.documentId);
      setBirthDate(
        user.profile.birthDate
          ? new Date(user.profile.birthDate).toISOString().split('T')[0]
          : null,
      );
      setPhoneNumber(user.phoneNumber);
      setEmail(user.email);
      setRole(
        user.role
          ? UserRole[user.role.toUpperCase() as keyof typeof UserRole]
          : null,
      );
      setGender(
        user.profile.gender === 'm'
          ? UserGender.MALE
          : user.profile.gender === 'f'
            ? UserGender.FEMALE
            : null,
      );
    } catch (error) {
      console.error('Error al cargar el usuario:', error);
      toast.error('No se pudo cargar la información del usuario');
    }
  }, [id, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSubmit = async () => {
    if (!gender) {
      toast.error('Por favor, selecciona un género');
      return;
    }
    const genero = gender === UserGender.MALE ? 'hombre' : 'mujer';

    const result = registerSchema.safeParse({
      nombre: firstName,
      apellido: lastName,
      email,
      cedula: documentId,
      telefono: phoneNumber,
      fechaNacimiento: birthDate ? formatDate(birthDate) : null,
      genero,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        firstName: fieldErrors.nombre?.[0] || '',
        lastName: fieldErrors.apellido?.[0] || '',
        email: fieldErrors.email?.[0] || '',
        documentId: fieldErrors.cedula?.[0] || '',
        phoneNumber: fieldErrors.telefono?.[0] || '',
        birthDate: fieldErrors.fechaNacimiento?.[0] || '',
        gender: fieldErrors.genero?.[0] || '',
      });
      toast.error('Por favor, revisa los errores en el formulario');
      return;
    } else {
      setErrors({});
    }

    try {
      if (!token || typeof id !== 'string') {
        toast.error('Token o ID inválido');
        return;
      }

      const payload = {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        phoneNumber: phoneNumber ?? undefined,
        birthDate: birthDate ? formatDate(birthDate) : undefined,
        gender,
        role: role ?? undefined,
      };

      console.log('Datos a actualizar:', payload);
      await api.user.update(id, payload, token);
      toast.success('Usuario actualizado exitosamente');
      setTimeout(() => {
        router.push('/users');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      toast.error('Ocurrió un error al actualizar el usuario');
    }
  };

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <div className="mx-auto mb-4 max-w-[904px]">
              <Breadcrumb
                items={[
                  { label: 'Usuarios', href: '/users' },
                  {
                    label: `Editar Usuario #${id?.toString().slice(0, 3)}`,
                    href: '',
                  },
                ]}
              />
            </div>

            <div className="mx-auto max-w-[904px] rounded-[16px] bg-white p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_10px_15px_rgba(0,0,0,0.1)]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-[28px] font-normal leading-[42px] text-[#393938]">
                    Usuario: #{id?.toString().slice(0, 3)}
                  </h1>
                  <h5 className="text-[16px] font-normal leading-[42px] text-[#393938]">
                    Editar la información del Usuario
                  </h5>
                </div>
                <Button
                  className="rounded-[6px] text-[16px] font-medium leading-[24px]"
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={2.5}
                  textSize="16"
                  width="196px"
                  height="44px"
                  onClick={handleSubmit}
                  textColor={Colors.textWhite}
                >
                  Guardar Cambios
                </Button>
              </div>
              <div className="mb-8 grid grid-cols-2 items-start gap-x-16 gap-y-6">
                {/* Columna izquierda */}
                <div className="space-y-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={firstName ?? ''}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Cédula
                    </label>
                    <input
                      type="text"
                      value={documentId ?? ''}
                      onChange={(e) => setDocumentId(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                      disabled
                    />
                    {errors.documentId && (
                      <p className="text-sm text-red-500">
                        {errors.documentId}
                      </p>
                    )}
                  </div>

                  <div className="flex w-[249px] flex-col">
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Fecha de nacimiento
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={birthDate ?? ''}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-white px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                      />
                      {errors.birthDate && (
                        <p className="text-sm text-red-500">
                          {errors.birthDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      placeholder="Agrega número de teléfono"
                      value={phoneNumber ?? ''}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-white px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={lastName ?? ''}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-white px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Género
                    </label>
                    <div className="flex h-10 items-center gap-4">
                      <label className="flex items-center gap-2 text-[16px] text-[#393938]">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === UserGender.MALE}
                          onChange={() => setGender(UserGender.MALE)}
                          className="relative h-5 w-5 appearance-none rounded-full border-2 border-[#1C2143] before:absolute before:left-1/2 before:top-1/2 before:block before:h-2 before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:transform before:rounded-full before:bg-white before:opacity-0 before:content-[''] checked:border-[#1C2143] checked:bg-[#1C2143] checked:before:opacity-100 focus:ring-0"
                        />
                        Hombre
                      </label>
                      <label className="flex items-center gap-2 text-[16px] text-[#393938]">
                        <input
                          type="radio"
                          name="gender"
                          checked={gender === UserGender.FEMALE}
                          onChange={() => setGender(UserGender.FEMALE)}
                          className="relative h-5 w-5 appearance-none rounded-full border-2 border-[rgba(28,33,67,0.5)] before:absolute before:left-1/2 before:top-1/2 before:block before:h-2 before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:transform before:rounded-full before:bg-white before:opacity-0 before:content-[''] checked:border-[#1C2143] checked:bg-[#1C2143] checked:before:opacity-100 focus:ring-0"
                        />
                        Mujer
                      </label>
                      {errors.gender && (
                        <p className="text-sm text-red-500">{errors.gender}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Rol
                    </label>
                    <div className="relative">
                      <select
                        value={role ?? ''}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="h-10 w-full appearance-none rounded-[6px] border border-[#E7E7E6] bg-white px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                      >
                        {Object.values(UserRole).map((roleValue) => (
                          <option key={roleValue} value={roleValue}>
                            {roleLabels[roleValue]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#393938]">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email ?? ''}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                      disabled
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
