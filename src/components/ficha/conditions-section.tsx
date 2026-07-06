"use client";

import type { Condition } from "@/lib/types";
import { CONDITION_EFFECTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

interface Props {
  characterId: string;
  initialConditions: Condition[];
  onUpdate: (conditions: Condition[]) => void;
}

export function ConditionsSection({ characterId, initialConditions, onUpdate }: Props) {
  const allConditions = Object.entries(CONDITION_EFFECTS) as [Condition, { label: string; effect: string }][];

  async function toggleCondition(condition: Condition) {
    const updated = initialConditions.includes(condition)
      ? initialConditions.filter((c) => c !== condition)
      : [...initialConditions, condition];

    const supabase = createClient();
    await supabase.from("personagens").update({ conditions: updated }).eq("id", characterId);
    onUpdate(updated);
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-3">
      <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        Condições
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {allConditions.map(([key, { label, effect }]) => {
          const active = initialConditions.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleCondition(key)}
              className={`text-left border rounded-lg p-3 transition-all duration-300 ${
                active
                  ? "border-yellow-600/50 bg-yellow-400/5"
                  : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600"
              }`}
            >
              <div className={`text-[11px] font-mono ${active ? "text-yellow-300" : "text-zinc-400"}`}>
                {active ? "✓ " : ""}{label}
              </div>
              <p className="text-[9px] text-zinc-600 font-mono mt-0.5 leading-relaxed">
                {effect}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
