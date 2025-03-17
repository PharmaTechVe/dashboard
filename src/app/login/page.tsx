import LoginForm from './LoginForm';
import Image from 'next/image';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
export default function LoginPage() {
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
        <div className="absolute left-1/2 top-6 z-50 w-40 -translate-x-1/2 md:left-4 md:top-4 md:w-40 md:-translate-x-0">
          <Image
            src="/images/logo-horizontal.svg"
            alt="Pharmatech"
            width={128}
            height={32}
            layout="responsive"
            sizes="(max-width: 768px) 100vw, 128px"
          />
        </div>

        {/* Sección Izquierda - Formulario */}

        <div className="flex min-h-[70vh] w-full max-w-[70%] flex-col items-center justify-center rounded-lg border-t-0 bg-white p-8 shadow-lg">
          <LoginForm />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
