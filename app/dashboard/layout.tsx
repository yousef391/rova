"use client";

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Bell, Menu } from 'lucide-react';
import AuthGuard from '@/components/dashboard/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0d14] flex text-gray-100">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-[280px] flex flex-col">
        {/* Top Header */}
        <header className="h-auto min-h-[48px] lg:min-h-[80px] flex items-center justify-between px-3 lg:px-8 py-2 lg:py-0 sticky top-0 z-10 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-white/10 text-gray-400 transition-colors active:scale-95"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-medium hidden sm:block">Pages / Dashboard</span>
              <h1 className="text-sm lg:text-2xl font-black tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Admin Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400">
              <Bell size={18} />
            </button>
            
            <div className="flex items-center gap-2 lg:gap-3 pl-1 lg:pl-2 cursor-pointer">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold leading-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>Admin</span>
                <span className="text-xs text-gray-500 font-medium">Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 lg:p-8 pt-3 lg:pt-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
