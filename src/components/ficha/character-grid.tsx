import type { Character } from "@/lib/types";
import { Swords, Heart, Brain, User } from "lucide-react";
import Link from "next/link";

interface CharacterGridProps {
  characters: Character[];
}

export function CharacterGrid({ characters }: CharacterGridProps) {
  if (characters.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-xl p-12 text-center bg-zinc-950/50">
        <User size={32} className="mx-auto mb-4 text-zinc-700" />
        <p className="text-sm text-zinc-500 font-mono mb-2">
          Nenhum personagem criado ainda
        </p>
        <p className="text-xs text-zinc-700 font-mono mb-6">
          Crie seu primeiro personagem para começar
        </p>
        <Link
          href="/dashboard/ficha/nova"
          className="inline-block border border-zinc-700 rounded-lg px-6 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300"
        >
          Criar Personagem
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((char) => (
        <Link
          key={char.id}
          href={`/dashboard/ficha/${char.id}`}
          className="group border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-300 animate-fade-slide-up"
        >
          <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-100 mb-3 group-hover:text-white transition-colors">
            {char.name}
          </h2>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-500">
              <Heart size={12} />
              <span>
                Vida: {char.vida_atual}/{char.vida_max}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Brain size={12} />
              <span>
                Mente: {char.mente_atual}/{char.mente_max}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Swords size={12} />
              <span>Função: {char.role ?? "Nenhuma"}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-3 text-[10px] text-zinc-700 uppercase tracking-[0.15em]">
            {(["forca", "velocidade", "resistencia", "sabedoria", "carisma"] as const).map(
              (d) => (
                <span key={d} className="flex items-center gap-1">
                  {d.slice(0, 3).toUpperCase()}:{char[d]}
                </span>
              ),
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
