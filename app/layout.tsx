import type { Metadata } from 'next';
import '@fontsource-variable/geist';
import '@fontsource/geist-mono/400.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Acuity — Investment Research, Powered by Exa',
  description:
    'Investment-grade, cited, structured company research in under 90 seconds — powered by Exa Deep Research.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
