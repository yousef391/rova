import Sidebar from '@/components/dashboard/Sidebar';
import { Search, Bell } from 'lucide-react';
import AuthGuard from '@/components/dashboard/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F4F7FE] flex text-gray-900">
      <Sidebar />
      <div className="flex-1 lg:ml-[280px] flex flex-col">
        {/* Top Header */}
        <header className="h-[90px] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm font-medium">Pages / Dashboard</span>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white px-3 py-2 rounded-full shadow-sm">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#F4F7FE] px-4 py-2 rounded-full w-[240px]">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                style={{ fontFamily: "var(--font-dm)" }}
              />
            </div>
            
            <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors text-gray-400">
              <Bell size={20} />
            </button>
            
            <div className="flex items-center gap-3 pl-2 pr-1 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden text-blue-600 flex items-center justify-center font-bold">
                A
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>Admin Store</span>
                <span className="text-xs text-gray-400 font-medium">Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 pt-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
