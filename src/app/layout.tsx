
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { FlowsProvider } from '@/contexts/FlowsContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { Inter, Manrope } from 'next/font/google';
import { AnimatePresence } from 'framer-motion';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'A unique to-do list application',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          'font-body antialiased',
          'bg-background text-foreground',
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <FlowsProvider>
                {children}
                <Toaster />
            </FlowsProvider>
          </AuthProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
