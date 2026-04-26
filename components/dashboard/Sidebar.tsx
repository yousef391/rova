"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Settings,
  ShoppingBag,
  BarChart3,
  X
} from 'lucide-react';

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const menuGroups = [
    {
      title: "MENU",
      items: [
        { name: "Statistics", path: "/dashboard", icon: BarChart3 },
        { name: "Commandes", path: "/dashboard/orders", icon: ShoppingBag },
      ]
    },
    {
      title: "TOOLS",
      items: [
        { name: "Settings", path: "/dashboard/settings", icon: Settings },
      ]
    }
  ];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl leading-none">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
            NovaAdmin
          </span>
        </div>
        {onMobileClose && (
          <button 
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <div className="flex flex-col gap-8 flex-1">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-2 mb-1" style={{ fontFamily: "var(--font-dm)" }}>
              {group.title}
            </span>
            {group.items.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-500"} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`} style={{ fontFamily: "var(--font-dm)" }}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[280px] bg-[#0f1117] h-screen fixed left-0 top-0 border-r border-white/5 flex-col pt-8 pb-6 px-6 z-20 overflow-y-auto hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay + Drawer */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onMobileClose}
        />
        <aside 
          className={`absolute left-0 top-0 h-full w-[280px] bg-[#0f1117] flex flex-col pt-8 pb-6 px-6 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
