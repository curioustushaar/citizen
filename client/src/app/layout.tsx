import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { AuthProvider } from '@/lib/auth';

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
