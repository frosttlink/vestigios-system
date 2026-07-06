"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 noise-overlay scanline-overlay">
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-8 w-full max-w-md backdrop-blur-sm animate-fade-slide-up text-center">
          <p className="text-xs text-zinc-500 font-mono">Carregando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(() => searchParams.get("reset") === "true");
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 noise-overlay scanline-overlay">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-8 w-full max-w-md backdrop-blur-sm animate-fade-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-xl uppercase tracking-[0.3em] text-zinc-100 mb-2">
            Vestígios
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Acessar Sistema
          </p>
        </div>

        {resetMode && searchParams.get("reset") === "true" ? (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <p className="text-xs text-zinc-500 font-mono text-center">
              Defina sua nova senha.
            </p>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs font-mono text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-zinc-700 rounded-lg px-6 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Redefinir Senha"}
            </button>
          </form>
        ) : resetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <p className="text-xs text-zinc-500 font-mono text-center">
              Digite seu email para receber o link de redefinição de senha.
            </p>
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2"
              >
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono text-center">{error}</p>
            )}

            {resetSent ? (
              <p className="text-green-400 text-xs font-mono text-center">
                Email enviado! Verifique sua caixa de entrada.
              </p>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-zinc-700 rounded-lg px-6 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar Link"}
              </button>
            )}

            <button
              type="button"
              onClick={() => { setResetMode(false); setResetSent(false); }}
              className="w-full text-xs text-zinc-600 font-mono hover:text-zinc-400 transition-colors"
            >
              Voltar ao login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-zinc-700 rounded-lg px-6 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="w-full text-xs text-zinc-600 font-mono hover:text-zinc-400 transition-colors"
            >
              Esqueci minha senha
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600 font-mono">
          Não tem conta?{" "}
          <a
            href="/cadastro"
            className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}
