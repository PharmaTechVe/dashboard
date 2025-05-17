'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Calendar from '@/components/Calendar';
import RadioButton from '@/components/RadioButton';
import { Colors } from '@/styles/styles';
import { toast } from 'react-toastify';
import { api } from '@/lib/sdkConfig';
import { registerSchema } from '@/lib/validations/registerSchema';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { UserGender, UserRole } from '@pharmatech/sdk';
import Input from '@/components/Input/Input';
import { convertSlashDateToIso } from '@/lib/utils/useFormatDate';

// Mapeo para mostrar etiquetas en el dropdown y obtener el valor que espera la API
const roleMapping: Record<string, UserRole> = {
  Administrador: UserRole.ADMIN,
  'Administrador de Sucursal': UserRole.BRANCH_ADMIN,
  Cliente: UserRole.CUSTOMER,
  Delivery: UserRole.DELIVERY,
};

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'messages' in error) {
    const errorObj = error as Record<string, unknown>;
    const messages = errorObj.messages;
    if (typeof messages === 'string') {
      return messages;
    } else if (Array.isArray(messages)) {
      // Se busca el primer elemento que sea string
      const firstString = messages.find(
        (msg): msg is string => typeof msg === 'string',
      );
      return firstString || 'Error';
    }
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    const errorObj = error as Record<string, unknown>;
    const message = errorObj.message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return 'Ocurrió un error inesperado';
}
export default function NewUserPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Actualiza la fecha desde el componente Calendar
  const handleDateSelect = (date: string) => {
    setBirthDate(date);
  };

  const handleSubmit = async () => {
    // Validar que se haya seleccionado un género
    if (!gender) {
      toast.error('Por favor, selecciona un género');
      return;
    }

    // Transformar gender a "hombre" o "mujer" (ya que el schema espera estos valores)
    const genero = gender === UserGender.MALE ? 'hombre' : 'mujer';

    // Prepara los datos para la validación usando el schema
    const result = registerSchema.safeParse({
      nombre: firstName,
      apellido: lastName,
      email,
      cedula: documentId,
      telefono: phoneNumber,
      fechaNacimiento: convertSlashDateToIso(birthDate), // Se espera formato yyyy-mm-dd
      genero,
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
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
    }

    // Si la validación es exitosa, limpia errores y procede a enviar
    setErrors({});
    setLoading(true);

    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        setLoading(false);
        return;
      }

      const mappedRole = roleMapping[role] || UserRole.CUSTOMER;
      const formattedBirthDate = convertSlashDateToIso(birthDate);

      const payload = {
        firstName,
        lastName,
        email,
        documentId,
        phoneNumber: phoneNumber.trim(),
        birthDate: formattedBirthDate,
        gender,
        role: mappedRole,
      };

      console.log('Payload a enviar:', payload);
      await api.user.create(payload, token);
      toast.success('Usuario creado exitosamente');

      setFirstName('');
      setLastName('');
      setDocumentId('');
      setGender('');
      setBirthDate('');
      setRole('');
      setPhoneNumber('');
      setEmail('');
      setErrors({});

      setTimeout(() => {
        router.push('/users');
      }, REDIRECTION_TIMEOUT);
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Usuarios', href: '/users' },
            { label: 'Crear Usuario', href: '' },
          ]}
        />
      </div>
      <div className="mx-auto max-w-[904px] rounded-[16px] bg-white p-12 shadow-lg">
        <div className="mb-8 flex flex-col items-center justify-between md:flex-row">
          <h1 className="text-[28px] font-normal leading-[42px] text-[#393938]">
            Nuevo Usuario
          </h1>
          <Button
            color={Colors.primary}
            paddingX={4}
            paddingY={2.5}
            textSize="16"
            width="196px"
            height="44px"
            onClick={handleSubmit}
            textColor={Colors.textWhite}
            disabled={loading}
            className="font-poppins rounded-[6px] border-none bg-[#1C2143] text-[16px] font-medium leading-[24px] text-white transition-colors hover:bg-[#2D365F] focus:outline-none focus:ring-2 focus:ring-[#1C2143]/50 active:bg-[#151A35]"
          >
            {loading ? 'Cargando...' : 'Agregar Usuario'}
          </Button>
        </div>
        <p className="pb-8 text-[16px] font-normal text-[#393938]">
          Agrega la información del usuario
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Nombre"
              type="text"
              placeholder="Agrega el nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              helperText={errors.firstName}
              helperTextColor={Colors.semanticDanger}
              borderSize="1px"
              borderColor="#E7E7E6"
            />
          </div>
          <div>
            <Input
              label="Apellido"
              type="text"
              placeholder="Agrega el apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              helperText={errors.lastName}
              helperTextColor={Colors.semanticDanger}
              borderSize="1px"
              borderColor="#E7E7E6"
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Cédula"
              type="text"
              placeholder="Agrega el número de cédula"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              helperText={errors.documentId}
              helperTextColor={Colors.semanticDanger}
              borderSize="1px"
              borderColor="#E7E7E6"
            />
          </div>
          <div>
            <label className="block text-[16px] font-medium text-gray-600">
              Género
            </label>
            <div className="mt-1 flex gap-6">
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
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-[16px] font-medium text-gray-600">
              Fecha de nacimiento
            </label>
            <div className="relative mt-1">
              <Calendar onDateSelect={handleDateSelect} />
            </div>
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
            )}
          </div>
          <div>
            <label className="block text-[16px] font-medium text-gray-600">
              Rol
            </label>
            <Dropdown
              items={[
                'Administrador',
                'Administrador de Sucursal',
                'Cliente',
                'Delivery',
              ]}
              placeholder="Selecciona el Rol"
              selected={role}
              onChange={(value) => setRole(value)}
              width="100%"
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Teléfono"
              type="text"
              placeholder="Agrega número de teléfono"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              helperText={errors.phoneNumber}
              helperTextColor={Colors.semanticDanger}
              borderSize="1px"
              borderColor="#E7E7E6"
            />
          </div>
          <div>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="Agrega correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText={errors.email}
              helperTextColor={Colors.semanticDanger}
              borderSize="1px"
              borderColor="#E7E7E6"
            />
          </div>
        </div>
      </div>
    </>
  );
}
