"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Senhas não conferem");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/login?cadastro=confirmacao");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 noise-overlay scanline-overlay">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 sm:p-8 w-full max-w-md backdrop-blur-sm animate-fade-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-xl uppercase tracking-[0.3em] text-zinc-100 mb-2">
            Criar Conta
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Registre-se no sistema
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-zinc-700 rounded-lg px-6 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando..." : "Criar Conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-600 font-mono">
          Já tem conta?{" "}
          <a
            href="/login"
            className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
          >
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
