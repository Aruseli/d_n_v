import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const aquireFont = localFont({
  src: '../public/aquire-font/AquireRegular.otf',
  variable: '--font-aquire',
});
