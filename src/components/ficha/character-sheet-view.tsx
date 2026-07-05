"use client";

import type { Character } from "@/lib/types";
import { DOMAINS, ACTIONS, ROLES } from "@/lib/constants";
import { performTest, rollD10, testLabel } from "@/lib/dice";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dice1, Heart, Brain, Swords, ArrowLeft, Plus, Minus, Coins, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  character: Character;
}

export function CharacterSheetView({ character }: Props) {
  const router = useRouter();
  const [vida, setVida] = useState(character.vida_atual);
  const [mente, setMente] = useState(character.mente_atual);
  const [pi, setPi] = useState(character.pi);
  const [pt, setPt] = useState(character.pt);
  const [lastRoll, setLastRoll] = useState<{
    value: number;
    success: { text: string; color: string };
    total: number;
  } | null>(null);

  const roleInfo = character.role ? ROLES.find((r) => r.key === character.role) : null;

  function handleRoll(actionValue: number) {
    const natural = rollD10();
    const total = natural + actionValue;
    const success = testLabel(
      natural === 1 ? "desastre" : natural === 10 ? "critico" : total >= 8 ? "sucesso" : "falha",
    );
    setLastRoll({ value: natural, success, total });
  }

  function handleDomainRoll(domainValue: number) {
    const natural = rollD10();
    const total = natural + domainValue;
    const success = testLabel(
      natural === 1 ? "desastre" : natural === 10 ? "critico" : total >= 8 ? "sucesso" : "falha",
    );
    setLastRoll({ value: natural, success, total });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      {lastRoll && (
        <div className="fixed top-4 right-4 bg-zinc-950 border border-zinc-700 rounded-xl p-4 z-50 animate-fade-slide-up shadow-2xl">
          <p className="text-xs text-zinc-500 font-mono mb-2">Última Rolagem</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono text-zinc-100">{lastRoll.value}</span>
            <span className="text-xs text-zinc-600">+</span>
            <span className="text-sm font-mono text-zinc-400">{lastRoll.total - lastRoll.value}</span>
            <span className="text-lg text-zinc-500">=</span>
            <span className="text-xl font-mono text-zinc-100">{lastRoll.total}</span>
          </div>
          <p className={`text-xs font-mono mt-1 ${lastRoll.success.color}`}>
            {lastRoll.success.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda — Info + Domínios */}
        <div className="space-y-6">
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-1">
              {character.name}
            </h1>
            {roleInfo && (
              <span className="text-xs text-zinc-500 font-mono">{roleInfo.label}</span>
            )}
            {character.description && (
              <p className="text-xs text-zinc-400 font-mono mt-3 leading-relaxed">
                {character.description}
              </p>
            )}
          </div>

          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Domínios
            </h2>
            <div className="space-y-3">
              {DOMAINS.map((d) => {
                const val = character[d.key];
                return (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase tracking-[0.1em] text-zinc-300">
                        {d.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-zinc-100">{val}</span>
                        <button
                          type="button"
                          onClick={() => handleDomainRoll(val)}
                          className="text-zinc-600 hover:text-zinc-300 transition-colors"
                          title="Rolar teste"
                        >
                          <Dice1 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-500 rounded-full transition-all"
                        style={{ width: `${(val / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna do meio — Ações + Função */}
        <div className="space-y-6">
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Ações
            </h2>
            <div className="space-y-1">
              {ACTIONS.map((a) => {
                const val = character.actions[a.key] ?? 0;
                return (
                  <div key={a.key} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-zinc-400 font-mono">{a.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-zinc-100 w-4 text-right">
                        {val}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRoll(val)}
                        disabled={val === 0}
                        className="text-zinc-700 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Rolar teste"
                      >
                        <Dice1 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {roleInfo && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Função: {roleInfo.label}
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                {roleInfo.ability}
              </p>
            </div>
          )}

          {character.fears && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Medos
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                {character.fears}
              </p>
            </div>
          )}
        </div>

        {/* Coluna da direita — Stats */}
        <div className="space-y-6">
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Atributos
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-green-400" />
                    <span className="text-xs text-zinc-400 font-mono">Vida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVida((v) => Math.max(0, v - 1))}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-mono text-green-400">
                      {vida}/{character.vida_max}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVida((v) => Math.min(character.vida_max, v + 1))}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(vida / character.vida_max) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Brain size={14} className="text-blue-400" />
                    <span className="text-xs text-zinc-400 font-mono">Mente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMente((m) => Math.max(0, m - 1))}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-mono text-blue-400">
                      {mente}/{character.mente_max}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMente((m) => Math.min(character.mente_max, m + 1))}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(mente / character.mente_max) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-yellow-400" />
                  <span className="text-xs text-zinc-500 font-mono">PI</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPi((p) => Math.max(0, p - 1))}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-mono text-yellow-400">{pi}</span>
                    <button
                      type="button"
                      onClick={() => setPi((p) => p + 1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-red-400" />
                  <span className="text-xs text-zinc-500 font-mono">PT</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPt((t) => Math.max(0, t - 1))}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-mono text-red-400">{pt}</span>
                    <button
                      type="button"
                      onClick={() => setPt((t) => t + 1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Rolagem Rápida
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {([6, 8, 10, 12] as const).map((dc) => (
                <button
                  key={dc}
                  type="button"
                  onClick={() => {
                    const natural = rollD10();
                    const total = natural;
                    const success = testLabel(
                      natural === 1 ? "desastre" : natural === 10 ? "critico" : total >= dc ? "sucesso" : "falha",
                    );
                    setLastRoll({ value: natural, success, total });
                  }}
                  className="border border-zinc-800 rounded-lg p-2 text-center hover:border-zinc-600 transition-colors"
                >
                  <span className="text-[10px] text-zinc-500 font-mono">DC {dc}</span>
                  <Dice1 size={12} className="mx-auto mt-1 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>

          {character.backstory && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
                História
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed whitespace-pre-wrap">
                {character.backstory}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
