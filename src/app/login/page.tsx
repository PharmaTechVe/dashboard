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
        {/* Sección Izquierda - Formulario */}

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
