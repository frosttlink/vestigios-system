"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Swords, Dice1 } from "lucide-react";
import { rollMultiple } from "@/lib/dice";

export default function RolarDadosPage() {
  const [results, setResults] = useState<number[]>([]);
  const [diceInput, setDiceInput] = useState("1d10");
  const [history, setHistory] = useState<string[]>([]);

  function handleRoll() {
    const match = diceInput.match(/^(\d+)d(\d+)(?:\+(\d+))?$/);
    if (!match) return;

    const count = Number.parseInt(match[1], 10);
    const sides = Number.parseInt(match[2], 10);
    const bonus = match[3] ? Number.parseInt(match[3], 10) : 0;

    const rolls = rollMultiple(count, sides);
    const total = rolls.reduce((a, b) => a + b, 0) + bonus;
    setResults(rolls);
    setHistory((prev) => [
      `${diceInput}: [${rolls.join(", ")}]${bonus ? ` +${bonus}` : ""} = ${total}`,
      ...prev.slice(0, 49),
    ]);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-8">
        Rolar Dados
      </h1>

      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50 mb-6">
        <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
          Fórmula
        </label>
        <div className="flex gap-3">
          <input
            value={diceInput}
            onChange={(e) => setDiceInput(e.target.value)}
            className="flex-1 bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="Ex: 2d6, 1d10+2"
          />
          <button
            type="button"
            onClick={handleRoll}
            className="flex items-center gap-2 border border-zinc-700 rounded-lg px-6 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300"
          >
            <Dice1 size={14} />
            Rolar
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "1d10+2", "3d4"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setDiceInput(f);
            }}
            className="border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
          >
            {f}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50 mb-6 animate-fade-slide-up">
          <div className="flex items-center gap-3 justify-center py-4">
            {results.map((r, i) => (
              <span
                key={i}
                className="text-3xl font-mono text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Histórico
          </h2>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {history.map((h, i) => (
              <p key={i} className="text-xs text-zinc-600 font-mono">
                {h}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
