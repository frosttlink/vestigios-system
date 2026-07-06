"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, User } from "lucide-react";

interface Props {
  campaignId: string;
  inviteId: string;
  characters: { id: string; name: string }[];
}

export function AcceptInviteForm({ campaignId, inviteId, characters }: Props) {
  const router = useRouter();
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!selectedChar) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: memberError } = await supabase
      .from("campanha_membros")
      .insert({
        campanha_id: campaignId,
        user_id: user.id,
        character_id: selectedChar,
      });

    if (memberError) {
      setError(String(memberError?.message ?? "Erro ao aceitar convite"));
      setLoading(false);
      return;
    }

    await supabase
      .from("campanha_convites")
      .update({ usado: true })
      .eq("id", inviteId);

    router.push(`/dashboard/campanha/${campaignId}`);
    router.refresh();
  }

  if (characters.length === 0) {
    return (
      <div className="text-center">
        <p className="text-xs text-zinc-500 font-mono mb-4">
          Você precisa criar um personagem primeiro.
        </p>
        <Link
          href={"/dashboard/ficha/nova"}
          className="inline-block border border-zinc-700 rounded-lg px-6 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300"
        >
          Criar Personagem
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 font-mono text-center">
        Escolha qual personagem usar nesta campanha
      </p>

      <div className="space-y-2">
        {characters.map((char) => (
          <button
            key={char.id}
            type="button"
            onClick={() => setSelectedChar(char.id)}
            className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 text-left transition-all duration-300 ${
              selectedChar === char.id
                ? "border-zinc-400 bg-zinc-900/80"
                : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <User size={14} className="text-zinc-500" />
              <span className="text-sm text-zinc-200 font-mono">{char.name}</span>
            </div>
            {selectedChar === char.id && (
              <Check size={14} className="text-green-400" />
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-400 font-mono text-center">{error}</p>
      )}

      <button
        type="button"
        onClick={handleAccept}
        disabled={!selectedChar || loading}
        className="w-full border border-zinc-700 rounded-lg px-6 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Entrando..." : "Entrar na Campanha"}
      </button>
    </div>
  );
}
