"use client";

import { useState } from "react";
import { rollD6 } from "@/lib/dice";
import { Link as LinkIcon, Dice1 } from "lucide-react";

interface Props {
  characterPi: number;
  onPiLoss: (loss: number) => void;
}

export function SynchronicityTest({ characterPi, onPiLoss }: Props) {
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState<{ player1: number; player2: number }[]>([]);
  const [outcome, setOutcome] = useState<"success" | "failure" | null>(null);
  const [active, setActive] = useState(false);

  function roll() {
    const player1 = rollD6();
    const player2 = rollD6();
    const newResults = [...results, { player1, player2 }];
    setResults(newResults);
    setAttempts(attempts + 1);

    if (player1 === player2) {
      setOutcome("success");
      setActive(false);
    } else if (attempts >= 3) {
      setOutcome("failure");
      onPiLoss(3);
      setActive(false);
    }
  }

  function reset() {
    setAttempts(0);
    setResults([]);
    setOutcome(null);
    setActive(true);
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <LinkIcon size={12} /> Teste de Sincronia
        </h2>
        {!active && outcome === null && (
          <button
            type="button"
            onClick={reset}
            className="border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
          >
            Iniciar
          </button>
        )}
      </div>

      {active && (
        <div className="space-y-3">
          <p className="text-[10px] text-zinc-500 font-mono">
            Tentativa {attempts + 1}/3 — Ambos jogadores rolam 1d6:
          </p>
          <button
            type="button"
            onClick={roll}
            className="flex items-center gap-2 border border-zinc-700 rounded-lg px-4 py-3 text-xs font-mono text-zinc-300 hover:border-zinc-500 hover:text-white transition-all mx-auto"
          >
            <Dice1 size={14} />
            Rolar Dados
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1">
          {results.map((r, i) => (
            <div key={i} className="text-[10px] text-zinc-400 font-mono flex items-center gap-3">
              <span className="text-zinc-600">#{i + 1}:</span>
              <span>J1: <span className="text-zinc-200">{r.player1}</span></span>
              <span>J2: <span className="text-zinc-200">{r.player2}</span></span>
              {r.player1 === r.player2 && <span className="text-green-400">✓</span>}
            </div>
          ))}
        </div>
      )}

      {outcome === "success" && (
        <div className="text-[10px] text-green-400 font-mono bg-green-400/10 border border-green-600/30 rounded px-3 py-2">
          Sincronia bem-sucedida! Ação passa automaticamente.
        </div>
      )}

      {outcome === "failure" && (
        <div className="text-[10px] text-red-400 font-mono bg-red-400/10 border border-red-600/30 rounded px-3 py-2">
          Falha na sincronia! Ambos perdem 3 PI.
        </div>
      )}
    </div>
  );
}
