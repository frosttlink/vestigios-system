"use client";

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

  async function handleLogout() {
    await signOut();
    router.refresh();
  }

  return (
    <div className="min-h-screen flex noise-overlay scanline-overlay">
      <aside className="w-64 bg-zinc-950/90 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <a href="/dashboard" className="block">
            <h1 className="text-sm uppercase tracking-[0.3em] text-zinc-100 glitch-text">
              Vestígios
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-1">
              Sistema de Fichas
            </p>
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? "bg-zinc-800/50 text-zinc-100 border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-600 truncate max-w-[140px]">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-zinc-600 hover:text-zinc-300 transition-colors"
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
