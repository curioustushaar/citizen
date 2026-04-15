import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'AI Grievance Intelligence System',
  description: 'Smart Sarkari Complaint Resolver — AI-powered smart city governance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
