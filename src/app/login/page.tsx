'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import Image from 'next/image';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';

export default function LoginPage() {
  const { token, user, loading } = useAuth();
  const router = useRouter();

  // 🔐 Si ya está autenticado, redirige (previene acceso al login)
  useEffect(() => {
    if (!loading && token && user) {
      router.replace('/products');
    }
  }, [token, user, loading, router]);

  // 🚫 Si aún carga contexto, muestra estado
  if (loading) {
    return <h1 className="p-4 text-lg">Verificando sesión...</h1>;
  }

  // ⛔ Prevención extra: no renderiza login si ya hay sesión
  if (token && user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Iniciar Sesión | Pharmatech</title>
        <meta
          name="description"
          content="Inicia sesión en Pharmatech y accede a la mejor solución para tu salud."
        />
      </Head>
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="flex min-h-[80vh] w-full max-w-[35%] flex-col items-center justify-center rounded-lg border-t-0 bg-white py-8 shadow-lg">
          <div className="mb-6 flex w-40">
            <Image
              src="/images/logo-horizontal.svg"
              alt="Pharmatech"
              width={128}
              height={32}
              layout="responsive"
              sizes="(max-width: 768px) 100vw, 128px"
            />
          </div>
          <LoginForm />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
