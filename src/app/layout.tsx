import type { Metadata } from 'next';
import theme from '../styles/styles';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Pharmatech',
  description: 'La farmacia más grande de Venezuela',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={theme.poppins.variable}>
      <body className="m-0 min-h-screen p-0">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
