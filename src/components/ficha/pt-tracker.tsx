"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Zap, Brain, AlertTriangle, Skull } from "lucide-react";
import { PT_THRESHOLDS } from "@/lib/constants";
import { rollD10, rollD6 } from "@/lib/dice";

interface Props {
  characterId: string;
  pt: number;
  menteMax: number;
  resistencia: number;
  sabedoria: number;
  onUpdate: (pt: number) => void;
}

export function PTTracker({ characterId, pt, menteMax, resistencia, sabedoria, onUpdate }: Props) {
  const [showResistTest, setShowResistTest] = useState(false);
  const [resistResult, setResistResult] = useState<{ roll: number; passed: boolean } | null>(null);

  async function addPT(delta: number) {
    const newPt = Math.max(0, pt + delta);
    const supabase = createClient();
    await supabase.from("personagens").update({ pt: newPt }).eq("id", characterId);
    onUpdate(newPt);
  }

  function testResist() {
    const roll = rollD10() + resistencia;
    const passed = roll >= 8;
    setResistResult({ roll, passed });
    if (!passed) {
      addPT(rollD6());
    }
  }

  const ptLevel = PT_THRESHOLDS.filter((t) => pt >= t.value).length;
  const isTenso = pt > menteMax;
  const isInsane = pt >= menteMax * 2;

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <Zap size={12} className="text-red-400" /> Tensão
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => addPT(-1)}
            className="w-5 h-5 rounded border border-zinc-700 text-zinc-500 hover:text-white text-[10px] transition-all"
          >
            -
          </button>
          <span className="text-sm font-mono text-red-400 w-6 text-center">{pt}</span>
          <button
            type="button"
            onClick={() => setShowResistTest(true)}
            className="w-5 h-5 rounded border border-zinc-700 text-zinc-500 hover:text-white text-[10px] transition-all"
          >
            +
          </button>
        </div>
      </div>

      {/* PT bar */}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all"
          style={{ width: `${Math.min(100, (pt / (menteMax * 2)) * 100)}%` }}
        />
      </div>

      {/* PT effects */}
      <div className="space-y-1">
        {pt >= 5 && (
          <div className="flex items-center gap-2 text-[10px] text-yellow-400 font-mono">
            <AlertTriangle size={10} />
            Desconforto / Paranoia
          </div>
        )}
        {pt >= 10 && (
          <div className="flex items-center gap-2 text-[10px] text-orange-400 font-mono">
            <AlertTriangle size={10} />
            Alucinações
          </div>
        )}
        {isTenso && (
          <div className="flex items-center gap-2 text-[10px] text-red-400 font-mono">
            <Zap size={10} />
            Tenso: -3 em qualquer teste
          </div>
        )}
        {isInsane && (
          <div className="flex items-center gap-2 text-[10px] text-red-500 font-mono">
            <Skull size={10} />
            Enlouqueceu! Mestre toma controle parcial
          </div>
        )}
      </div>

      {/* Resistance test modal */}
      {showResistTest && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/80 space-y-3">
          <p className="text-[10px] text-zinc-400 font-mono">
            Teste de Resistência (1d10 + Resistência/Sabedoria ≥ 8) para evitar PT:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                testResist();
                setShowResistTest(false);
              }}
              className="flex-1 border border-zinc-700 rounded px-3 py-2 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all"
            >
              Rolar (Resistência)
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResistTest(false);
                addPT(rollD6());
              }}
              className="flex-1 border border-red-900/50 rounded px-3 py-2 text-[10px] font-mono text-red-400 hover:border-red-500 transition-all"
            >
              Falhar Automaticamente
            </button>
          </div>
          {resistResult && (
            <p className={`text-[10px] font-mono ${resistResult.passed ? "text-green-400" : "text-red-400"}`}>
              Rolagem: {resistResult.roll} — {resistResult.passed ? "Passou! Nenhum PT ganho" : "Falhou! +1d6 PT"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
