import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'AI Grievance Intelligence System',
  description: 'Smart Sarkari Complaint Resolver — AI-powered smart city governance',
};

import UserLayout from '@/components/layout/UserLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <UserLayout>{children}</UserLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
