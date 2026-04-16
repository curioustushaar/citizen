'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`hidden lg:flex transition-all duration-300 ${
          sidebarOpen ? 'w-[260px]' : 'w-[72px]'
        }`}
      >
        <AdminSidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0"
            style={{
              background: 'rgba(5, 8, 16, 0.75)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-[260px] z-50">
            <AdminSidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 grid-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
