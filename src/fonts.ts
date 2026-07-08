import { Inter, JetBrains_Mono } from 'next/font/google';

export const appFont = Inter({
  display: 'swap',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

export const swaggerEditorFont = JetBrains_Mono({
  display: 'swap',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-swagger-editor',
  weight: ['300', '400', '500', '600', '700'],
});
