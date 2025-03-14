import type { Metadata } from 'next';
import theme from '../styles/styles';

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
      <body>{children}</body>
    </html>
  );
}
