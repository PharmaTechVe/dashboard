'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { registerSchema } from '@/lib/validations/registerSchema';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';
import { UserGender, UserRole } from '@pharmatech/sdk';
import Input from '@/components/Input/Input';
import Dropdown from '@/components/Dropdown';
import RadioButton from '@/components/RadioButton';
import { FontSizes } from '@/styles/styles';
import { convertSlashDateToIso } from '@/lib/utils/useFormatDate';

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.BRANCH_ADMIN]: 'Administrador de Sucursal',
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.DELIVERY]: 'Delivery',
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
    if (!role) {
      setErrors((prev) => ({ ...prev, role: 'Por favor, selecciona un rol' }));
      toast.error('Por favor, selecciona un rol');
      return;
    }
    const genero = gender === UserGender.MALE ? 'hombre' : 'mujer';

    const result = registerSchema.safeParse({
      nombre: firstName,
      apellido: lastName,
      email,
      cedula: documentId,
      telefono: phoneNumber,
      fechaNacimiento: birthDate ? convertSlashDateToIso(birthDate) : null,
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
        birthDate: birthDate ? convertSlashDateToIso(birthDate) : undefined,
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
            <h1
              className="text-[28px] font-normal leading-[42px]"
              style={{ color: Colors.textMain }}
            >
              Usuario: #{id?.toString().slice(0, 3)}
            </h1>
            <h5
              className="text-[16px] font-normal leading-[42px]"
              style={{ color: Colors.textMain }}
            >
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
              <Input
                label="Nombre"
                placeholder="Agrega el nombre"
                type="text"
                value={firstName ?? ''}
                onChange={(e) => setFirstName(e.target.value)}
                helperText={errors.firstName}
                helperTextColor={Colors.semanticDanger}
                borderSize="1px"
                borderColor={Colors.stroke}
              />
            </div>

            <div>
              <Input
                label="Cédula"
                type="text"
                value={documentId ?? ''}
                onChange={(e) => setDocumentId(e.target.value)}
                helperText={errors.documentId}
                helperTextColor={Colors.semanticDanger}
                borderSize="1px"
                borderColor={Colors.stroke}
                readViewOnly
              />
            </div>

            <div className="flex w-[249px] flex-col">
              <div className="relative">
                <Input
                  label="Fecha de nacimiento"
                  type="text"
                  value={birthDate ?? ''}
                  onChange={(e) => setBirthDate(e.target.value)}
                  helperText={errors.birthDate}
                  helperTextColor={Colors.semanticDanger}
                  borderColor={Colors.stroke}
                  borderSize="1px"
                />
              </div>
            </div>

            <div>
              <Input
                label="Teléfono"
                placeholder="Agrega número de teléfono"
                value={phoneNumber ?? ''}
                onChange={(e) => setPhoneNumber(e.target.value)}
                helperText={errors.phoneNumber}
                helperTextColor={Colors.semanticDanger}
                borderColor={Colors.stroke}
                borderSize="1px"
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <div>
              <Input
                label="Apellido"
                placeholder="Agrega el apellido"
                type="text"
                value={lastName ?? ''}
                onChange={(e) => setLastName(e.target.value)}
                helperText={errors.lastName}
                helperTextColor={Colors.semanticDanger}
                borderColor={Colors.stroke}
                borderSize="1px"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{
                  color: Colors.textLowContrast,
                  fontSize: FontSizes.b1.size,
                }}
              >
                Género
              </label>
              <div className="flex h-10 items-center gap-4">
                <RadioButton
                  text="Hombre"
                  selected={gender === UserGender.MALE}
                  onSelect={() => setGender(UserGender.MALE)}
                />
                <RadioButton
                  text="Mujer"
                  selected={gender === UserGender.FEMALE}
                  onSelect={() => setGender(UserGender.FEMALE)}
                />
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender}</p>
                )}
              </div>
            </div>

            <div>
              <div>
                <Dropdown
                  title="Rol"
                  placeholder="Selecciona un rol"
                  items={Object.values(roleLabels)}
                  selected={role ? roleLabels[role] : ''}
                  width="w-auto"
                  onChange={(label) => {
                    const entry = Object.entries(roleLabels).find(
                      ([, lbl]) => lbl === label,
                    );
                    if (entry) setRole(entry[0] as UserRole);
                  }}
                />
                {errors.role && (
                  <p
                    className="text-sm"
                    style={{ color: Colors.semanticDanger }}
                  >
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Input
                label="Correo electrónico"
                type="email"
                value={email ?? ''}
                onChange={(e) => setEmail(e.target.value)}
                helperText={errors.email}
                helperTextColor={Colors.semanticDanger}
                borderColor={Colors.stroke}
                borderSize="1px"
                readViewOnly
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
