"use client";

import { useState } from "react";
import { DOMAINS, ACTIONS } from "@/lib/constants";
import type { Domain, Action } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Plus } from "lucide-react";

interface Props {
  characterId: string;
  domains: Record<Domain, number>;
  actions: Record<Action, number>;
  sessionCount: number;
  onUpdate: () => void;
}

export function EvolutionPanel({ characterId, domains, actions, sessionCount, onUpdate }: Props) {
  const [showEvolve, setShowEvolve] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const sessionsUntilAbility = sessionCount > 0 && (sessionCount % 3 === 0 || sessionCount % 5 === 0);

  async function evolveDomain(key: Domain) {
    if (domains[key] >= 3) return;
    const supabase = createClient();
    await supabase.from("personagens").update({ [key]: domains[key] + 1 }).eq("id", characterId);
    onUpdate();
  }

  async function evolveAction(key: Action) {
    if (actions[key] >= 4) return;
    const supabase = createClient();
    const updated = { ...actions, [key]: actions[key] + 1 };
    await supabase.from("personagens").update({ actions: updated }).eq("id", characterId);
    onUpdate();
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <TrendingUp size={12} /> Evolução
        </h2>
        <button
          type="button"
          onClick={() => setShowEvolve(!showEvolve)}
          className="flex items-center gap-1 border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
        >
          <Plus size={10} /> {showEvolve ? "Fechar" : "Evoluir"}
        </button>
      </div>

      <p className="text-[10px] text-zinc-600 font-mono">
        Sessões realizadas: {sessionCount}
      </p>

      {sessionsUntilAbility && (
        <p className="text-[10px] text-purple-400 font-mono">
          ⭐ Habilidade especial disponível a cada 3-5 sessões!
        </p>
      )}

      {showEvolve && (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono block mb-2">+1 Domínio (máx 3):</span>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => {
                const atMax = domains[d.key] >= 3;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => evolveDomain(d.key)}
                    disabled={atMax}
                    className={`border rounded px-2.5 py-1 text-[10px] font-mono transition-all ${
                      atMax
                        ? "border-zinc-800 text-zinc-700 cursor-not-allowed"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {d.label} ({domains[d.key]}→{Math.min(3, domains[d.key] + 1)})
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 font-mono block mb-2">+1 Ação (máx 4):</span>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => {
                const atMax = actions[a.key] >= 4;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => evolveAction(a.key)}
                    disabled={atMax}
                    className={`border rounded px-2.5 py-1 text-[10px] font-mono transition-all ${
                      atMax
                        ? "border-zinc-800 text-zinc-700 cursor-not-allowed"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {a.label} ({actions[a.key]}→{Math.min(4, actions[a.key] + 1)})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
