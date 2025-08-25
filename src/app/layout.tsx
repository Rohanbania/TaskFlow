import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { FlowsProvider } from '@/contexts/FlowsContext';
import { Toaster } from '@/components/ui/toaster';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased',
          'bg-background text-foreground'
        )}
      >
        <FlowsProvider>
          {children}
          <Toaster />
        </FlowsProvider>
      </body>
    </html>
  );
}
