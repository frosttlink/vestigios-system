"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  Users,
  UserPlus,
  Swords,
  BookOpen,
  LogOut,
  Dice1,
  Skull,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth-actions";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Personagens", icon: Users },
  { href: "/dashboard/ficha/nova", label: "Nova Ficha", icon: UserPlus },
  { href: "/dashboard/campanha", label: "Campanhas", icon: BookOpen },
  { href: "/dashboard/mestre", label: "Mestre", icon: Skull },
  { href: "/dashboard/rolar", label: "Rolar Dados", icon: Dice1 },
];

export function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  async function handleLogout() {
    await signOut();
    router.refresh();
  }

  return (
    <div className="min-h-screen flex noise-overlay scanline-overlay">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-zinc-950/90 border-r border-zinc-800
          transition-transform duration-300 w-64
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <a href="/dashboard" className="block">
            <h1 className="text-sm uppercase tracking-[0.3em] text-zinc-100 glitch-text">
              Vestígios
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-1">
              Sistema de Fichas
            </p>
          </a>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? "bg-zinc-800/50 text-zinc-100 border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600 truncate max-w-[160px]">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-zinc-600 hover:text-zinc-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-h-screen pt-14 lg:pt-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 bg-zinc-950/90 border border-zinc-800 rounded-lg p-2.5 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
          title="Abrir menu"
        >
          <Menu size={20} />
        </button>
        {children}
      </main>
    </div>
  );
}
