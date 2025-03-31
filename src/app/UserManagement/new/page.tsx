'use client';

import { useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Calendar from '@/components/Calendar'; // Componente de calendario
import RadioButton from '@/components/RadioButton';
import { Colors } from '@/styles/styles';
import { registerSchema } from '@/lib/validations/registerSchema';
import { toast, ToastContainer } from 'react-toastify';
import { createUser, NewUser } from '../lib/userService';
import { useRouter } from 'next/navigation';

// Mapeo de roles: clave = opción mostrada, valor = lo que espera la API
const roleMapping: Record<string, string> = {
  Administrador: 'admin',
  'Administrador de Sucursal': 'branch_admin',
  Cliente: 'customer',
  Delivery: 'delivery',
};

export default function NewUserPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [gender, setGender] = useState<'m' | 'f' | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Función para seleccionar la fecha desde el componente Calendar
  const handleDateSelect = (date: string) => {
    setBirthDate(date);
  };

  const handleSubmit = async () => {
    console.log('handleSubmit disparado');
    // Validación usando el schema; asegúrate de que registerSchema incluya todos los campos necesarios.
    const result = registerSchema.safeParse({
      nombre: firstName,
      apellido: lastName,
      email,
      cedula: documentId,
      telefono: phoneNumber,
      fechaNacimiento: birthDate,
      genero: gender === 'm' ? 'hombre' : gender === 'f' ? 'mujer' : '',
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        firstName: fieldErrors.nombre?.[0] ?? '',
        lastName: fieldErrors.apellido?.[0] ?? '',
        email: fieldErrors.email?.[0] ?? '',
        documentId: fieldErrors.cedula?.[0] ?? '',
        phoneNumber: fieldErrors.telefono?.[0] ?? '',
        birthDate: fieldErrors.fechaNacimiento?.[0] ?? '',
        gender: fieldErrors.genero?.[0] ?? '',
      });
      return;
    }

    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const mappedRole = roleMapping[role] || 'customer';

      const payload: NewUser = {
        firstName,
        lastName,
        email,
        role: mappedRole,
        documentId,
        phoneNumber: phoneNumber.trim(),
        gender,
        birthDate,
      };
      console.log('Payload a enviar:', payload);

      await createUser(payload, token);
      toast.success('Usuario creado exitosamente');

      // Limpiar formulario
      setFirstName('');
      setLastName('');
      setDocumentId('');
      setGender('');
      setBirthDate('');
      setRole('');
      setPhoneNumber('');
      setEmail('');
      setErrors({});

      router.push('/UserManagement');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Ocurrió un error al crear el usuario');
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
                  { label: 'Usuarios', href: '/UserManagement' },
                  { label: 'Crear Usuario', href: '' },
                ]}
              />
            </div>
            <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Nuevo Usuario
                </h1>
                <Button
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="196px"
                  height="44px"
                  onClick={handleSubmit}
                  textColor={Colors.textWhite}
                >
                  Agregar Usuario
                </Button>
              </div>
              <p className="text-[16px] text-[#393938]">
                Agrega la información del usuario
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:outline-none"
                    placeholder="Agrega el nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Apellido
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:outline-none"
                    placeholder="Agrega el apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Cédula
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:outline-none"
                    placeholder="Agrega el número de cédula"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                  />
                  {errors.documentId && (
                    <p className="text-sm text-red-500">{errors.documentId}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Género
                  </label>
                  <div className="mt-1 flex gap-6">
                    <RadioButton
                      text="Hombre"
                      selected={gender === 'm'}
                      onSelect={() => setGender('m')}
                    />
                    <RadioButton
                      text="Mujer"
                      selected={gender === 'f'}
                      onSelect={() => setGender('f')}
                    />
                  </div>
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Fecha de nacimiento
                  </label>
                  <div className="relative">
                    <Calendar onDateSelect={handleDateSelect} />
                  </div>
                  {errors.birthDate && (
                    <p className="text-sm text-red-500">{errors.birthDate}</p>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Teléfono
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:outline-none"
                    placeholder="Agrega número de teléfono"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Correo electrónico
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:outline-none"
                    placeholder="Agrega correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
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
