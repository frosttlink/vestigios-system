"use client";

import type { Character, Domain, Action, Condition } from "@/lib/types";
import { DOMAINS, ACTIONS, ROLES, INITIAL_PI } from "@/lib/constants";
import { rollD10, rollDamage, testLabel } from "@/lib/dice";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InventorySection } from "./inventory-section";
import { ConditionsSection } from "./conditions-section";
import { PTTracker } from "./pt-tracker";
import { PowersSection } from "./powers-section";
import { RoleAbility } from "./role-ability";
import { SynchronicityTest } from "./synchronicity-test";
import { EvolutionPanel } from "./evolution-panel";
import {
  Dice1, Heart, Brain, Swords, ArrowLeft, Plus, Minus,
  Coins, Zap, User, BookOpen, AlertTriangle, Trash2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Props {
  character: Character;
}

export function CharacterSheetView({ character }: Props) {
  const router = useRouter();
  const [vida, setVida] = useState(character.vida_atual);
  const [mente, setMente] = useState(character.mente_atual);
  const [pi, setPi] = useState(character.pi);
  const [pt, setPt] = useState(character.pt);
  const [conditions, setConditions] = useState<Condition[]>(character.conditions);
  const [sessionCount, setSessionCount] = useState(character.session_count ?? 0);
  const [lastRoll, setLastRoll] = useState<{
    value: number;
    success: { text: string; color: string };
    total: number;
  } | null>(null);
  const [showSynchronicity, setShowSynchronicity] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const roleInfo = character.role ? ROLES.find((r) => r.key === character.role) : null;

  async function updateStat(field: string, value: number) {
    const supabase = createClient();
    await supabase.from("personagens").update({ [field]: value }).eq("id", character.id);
  }

  function handleVidaChange(delta: number) {
    const newV = Math.max(0, Math.min(character.vida_max, vida + delta));
    setVida(newV);
    updateStat("vida_atual", newV);
  }

  function handleMenteChange(delta: number) {
    const newM = Math.max(0, Math.min(character.mente_max, mente + delta));
    setMente(newM);
    updateStat("mente_atual", newM);
  }

  function handlePiChange(delta: number) {
    const newP = Math.max(0, pi + delta);
    setPi(newP);
    updateStat("pi", newP);
  }

  function handlePtChange(newPt: number) {
    setPt(newPt);
  }

  async function handleSessionComplete() {
    const newCount = sessionCount + 1;
    setSessionCount(newCount);
    const supabase = createClient();
    await supabase.from("personagens").update({ session_count: newCount }).eq("id", character.id);
  }

  function handleRoll(value: number) {
    const natural = rollD10();
    const total = natural + value;
    const success = testLabel(
      natural === 1 ? "desastre" : natural === 10 ? "critico" : total >= 8 ? "sucesso" : "falha",
    );
    setLastRoll({ value: natural, success, total });
  }

  const lifePct = character.vida_max > 0 ? (vida / character.vida_max) * 100 : 0;
  const mindPct = character.mente_max > 0 ? (mente / character.mente_max) * 100 : 0;
  const isTenso = pt > character.mente_max;
  const isInsane = pt >= character.mente_max * 2;

  return (
    <div className="p-8 max-w-7xl mx-auto">
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
        {/* Left column — Identity + Domains + PT */}
        <div className="space-y-6">
          {/* Identity */}
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100">
                {character.name}
              </h1>
            </div>
            {roleInfo && (
              <span className="text-xs text-zinc-500 font-mono">{roleInfo.label}</span>
            )}
            {character.description && (
              <>
                <p className="text-[11px] text-zinc-400 font-mono mt-3 leading-relaxed line-clamp-3">
                  {character.description}
                </p>
                {character.description.length > 100 && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-[9px] text-zinc-600 hover:text-zinc-400 font-mono mt-1"
                  >
                    {showFullDescription ? "Menos" : "Mais"}
                  </button>
                )}
              </>
            )}
            {character.fears && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-600">Medos</span>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">{character.fears}</p>
              </div>
            )}
          </div>

          {/* Domains */}
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
                          onClick={() => handleRoll(val)}
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

          {/* PT Tracker */}
          <PTTracker
            characterId={character.id}
            pt={pt}
            menteMax={character.mente_max}
            resistencia={character.resistencia}
            sabedoria={character.sabedoria}
            onUpdate={handlePtChange}
          />
        </div>

        {/* Middle column — Actions + Conditions + Powers + Synch */}
        <div className="space-y-6">
          {/* Actions */}
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

          {/* Conditions */}
          <ConditionsSection
            characterId={character.id}
            initialConditions={conditions}
            onUpdate={setConditions}
          />

          {/* Powers */}
          <PowersSection
            characterId={character.id}
            initialPowers={character.powers}
            onUpdate={() => router.refresh()}
          />

          {/* Synchronicity Test */}
          <SynchronicityTest characterPi={pi} onPiLoss={(loss) => handlePiChange(-loss)} />

          {/* Evolution */}
          <EvolutionPanel
            characterId={character.id}
            domains={{
              forca: character.forca,
              velocidade: character.velocidade,
              resistencia: character.resistencia,
              sabedoria: character.sabedoria,
              carisma: character.carisma,
            }}
            actions={character.actions}
            sessionCount={sessionCount}
            onUpdate={() => router.refresh()}
          />
        </div>

        {/* Right column — Stats + Role Ability + Backstory + Traumas */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
              Atributos
            </h2>

            <div className="space-y-4">
              {/* Vida */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-green-400" />
                    <span className="text-xs text-zinc-400 font-mono">Vida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVidaChange(-1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-mono text-green-400 min-w-[60px] text-right">
                      {vida}/{character.vida_max}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVidaChange(1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${lifePct}%` }}
                  />
                </div>
              </div>

              {/* Mente */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Brain size={14} className="text-blue-400" />
                    <span className="text-xs text-zinc-400 font-mono">Mente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMenteChange(-1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-mono text-blue-400 min-w-[60px] text-right">
                      {mente}/{character.mente_max}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMenteChange(1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${mindPct}%` }}
                  />
                </div>
              </div>

              {/* PI + PT */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-yellow-400" />
                  <span className="text-xs text-zinc-500 font-mono">PI</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePiChange(-1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-mono text-yellow-400 min-w-[20px] text-center">{pi}</span>
                    <button
                      type="button"
                      onClick={() => handlePiChange(1)}
                      className="text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                {/* Discovery PI gain buttons */}
                <div className="border-t border-zinc-800 pt-2 mt-1">
                  <span className="text-[9px] text-zinc-600 font-mono block mb-1.5">Ganho de PI por descoberta:</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handlePiChange(2)}
                      className="border border-zinc-800 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                      title="Descoberta leve (+2 PI)"
                    >
                      Leve +2
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePiChange(3 + Math.floor(Math.random() * 3))}
                      className="border border-zinc-800 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                      title="Descoberta média (+2 a +5 PI)"
                    >
                      Média 2-5
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePiChange(5 + Math.floor(Math.random() * 5))}
                      className="border border-zinc-800 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                      title="Descoberta grande (+5 a +9 PI)"
                    >
                      Grande 5-9
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const total = rollDamage("2d8");
                        handlePiChange(total);
                      }}
                      className="border border-purple-900/50 rounded px-2 py-0.5 text-[9px] font-mono text-purple-400 hover:border-purple-600 transition-all"
                      title="Vestígio (2d8 PI)"
                    >
                      Vestígio 2d8
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-red-400" />
                  <span className="text-xs text-zinc-500 font-mono">PT</span>
                  <span className="text-sm font-mono text-red-400">{pt}</span>
                </div>
              </div>

              {/* Tenso / Insane warning */}
              {isTenso && (
                <div className="flex items-center gap-2 text-[10px] text-red-400 font-mono bg-red-400/10 border border-red-600/30 rounded px-3 py-2">
                  <AlertTriangle size={10} />
                  Tenso: PT ({pt}) excede Mente ({character.mente_max}) — -3 em testes
                </div>
              )}
              {isInsane && (
                <div className="flex items-center gap-2 text-[10px] text-red-500 font-mono bg-red-500/10 border border-red-600/50 rounded px-3 py-2">
                  <AlertTriangle size={10} />
                  Enlouqueceu! PT ({pt}) ≥ 2× Mente ({character.mente_max * 2})
                </div>
              )}
            </div>
          </div>

          {/* Role Ability */}
          <RoleAbility
            characterId={character.id}
            role={character.role}
            pi={pi}
            pt={pt}
            onUpdate={(newPi, newPt) => {
              setPi(newPi);
              setPt(newPt);
            }}
          />

          {/* Quick Roll by DC */}
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
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
                  className="border border-zinc-800 rounded-lg p-3 text-center hover:border-zinc-600 transition-colors"
                >
                  <span className="text-[10px] text-zinc-500 font-mono">DC {dc}</span>
                  <Dice1 size={14} className="mx-auto mt-1 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <InventorySection
            characterId={character.id}
            initialInventory={character.inventory}
            initialEquipment={character.equipment}
            onUpdate={() => router.refresh()}
          />

          {/* Backstory */}
          {character.backstory && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2 flex items-center gap-2">
                <BookOpen size={12} /> História
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono leading-relaxed whitespace-pre-wrap">
                {character.backstory}
              </p>
            </div>
          )}

          {/* Traumas */}
          <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={12} className="text-red-400" /> Traumas
            </h2>
            {character.traumas && character.traumas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {character.traumas.map((t, i) => (
                  <span key={i} className="text-[10px] text-red-300 font-mono bg-red-400/5 border border-red-800/30 rounded px-2 py-1">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <AddTraumaForm characterId={character.id} onAdd={() => router.refresh()} />
          </div>

          {/* Session control */}
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">Sessões: {sessionCount}</span>
              <button
                type="button"
                onClick={handleSessionComplete}
                className="border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
              >
                +1 Sessão
              </button>
            </div>
          </div>

          {/* Character management */}
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50 space-y-2">
            <div className="flex gap-2">
              <Link
                href={`/dashboard/ficha/nova?edit=${character.id}`}
                className="flex-1 border border-zinc-700 rounded-lg px-3 py-2 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all text-center"
              >
                Editar Ficha
              </Link>
              <DeleteCharacterButton characterId={character.id} characterName={character.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTraumaForm({ characterId, onAdd }: { characterId: string; onAdd: () => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function addTrauma() {
    if (!value.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: char } = await supabase.from("personagens").select("traumas").eq("id", characterId).single() as { data: { traumas: string[] } | null };
    const traumas = [...(char?.traumas ?? []), value.trim()];
    await supabase.from("personagens").update({ traumas }).eq("id", characterId);
    setValue("");
    setLoading(false);
    onAdd();
  }

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100 placeholder-zinc-700"
        placeholder="Novo trauma..."
      />
      <button
        type="button"
        onClick={addTrauma}
        disabled={loading || !value.trim()}
        className="border border-zinc-700 rounded px-2.5 py-1.5 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-50"
      >
        Adicionar
      </button>
    </div>
  );
}

function DeleteCharacterButton({ characterId, characterName }: { characterId: string; characterName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("personagens").delete().eq("id", characterId);
    router.push("/dashboard");
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1 border border-red-900/50 rounded-lg px-3 py-2 text-[10px] font-mono text-red-400 hover:border-red-500 transition-all"
      >
        <Trash2 size={10} /> Excluir
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <span className="text-[9px] text-red-400 font-mono self-center">Excluir {characterName}?</span>
      <button
        type="button"
        onClick={handleDelete}
        className="border border-red-700 rounded px-2 py-1 text-[9px] font-mono text-red-300 hover:bg-red-900/30 transition-all"
      >
        Confirmar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="border border-zinc-700 rounded px-2 py-1 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-all"
      >
        Cancelar
      </button>
    </div>
  );
}
