"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Settings,
  ShoppingBag,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

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

  return (
    <aside className="w-[280px] bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col pt-8 pb-6 px-6 z-20 shadow-sm overflow-y-auto hidden lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-xl leading-none">N</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
          NovaAdmin
        </span>
      </div>

      {/* Nav Groups */}
      <div className="flex flex-col gap-8 flex-1">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1" style={{ fontFamily: "var(--font-dm)" }}>
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-400"} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`} style={{ fontFamily: "var(--font-dm)" }}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
