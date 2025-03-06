import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { DesktopMenu } from './components/menu/DesktopMenu';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggleWrapper } from './theme/ThemeToggleWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Deep Foundation',
  description:
    'An innovative data management solution that uses advanced proxy and event-driven capabilities to streamline complex data relationships and system integrations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <DesktopMenu />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
