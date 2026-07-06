"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Swords, Heart, Brain, Zap, Skull, Plus, Trash2, Dice1 } from "lucide-react";
import { rollMultiple, rollD10, rollDamage } from "@/lib/dice";
import { COMBAT_BATTLE_ACTIONS, COMBAT_SIMPLE_ACTIONS, CONDITION_EFFECTS, CRITICAL_HIT_THRESHOLD_MIN, FATAL_ATTACK_BONUS_PI, DAMAGE_FORMULAS } from "@/lib/constants";
import type { Condition, CombatParticipant, CombatState } from "@/lib/types";

interface CharacterBrief {
  id: string;
  name: string;
  vida_atual: number;
  vida_max: number;
  conditions: Condition[];
  forca: number;
  velocidade: number;
  resistencia: number;
  sabedoria: number;
  carisma: number;
  actions: Record<string, number>;
  role: string | null;
  pt: number;
}

interface EnemyBrief {
  id: string;
  name: string;
  vida: number;
  vida_max: number;
  defesa: number;
  pa: number;
  pa_max: number;
  tamanho: string;
  ponto_fraco: string;
  ataques: { name: string; type: string; damage: string; pa_cost: number; description: string }[];
}

interface Props {
  campaignId: string;
  campaignName: string;
  characters: CharacterBrief[];
}

export function CombatManager({ campaignId, campaignName, characters }: Props) {
  const [participants, setParticipants] = useState<CombatParticipant[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [enemyForm, setEnemyForm] = useState<EnemyBrief>({
    id: "",
    name: "",
    vida: 20,
    vida_max: 20,
    defesa: 10,
    pa: 50,
    pa_max: 50,
    tamanho: "Médio",
    ponto_fraco: "",
    ataques: [
      { name: "Ataque Simples", type: "simples", damage: "2d4", pa_cost: 5, description: "Corte pequeno" },
      { name: "Ataque Normal", type: "normal", damage: "3d4+2", pa_cost: 15, description: "Avanço com impulso" },
      { name: "Ataque Fatal", type: "fatal", damage: "3d6", pa_cost: 30, description: "Avanço cravando lâmina + dois golpes" },
    ],
  });
  const [showEnemyForm, setShowEnemyForm] = useState(false);
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);
  const [selectedDefender, setSelectedDefender] = useState<string | null>(null);
  const [defenderChoice, setDefenderChoice] = useState<"esquivar" | "defender" | null>(null);
  const [pendingAttack, setPendingAttack] = useState<{ attackerId: string; defenderId: string } | null>(null);
  const [attackRoll, setAttackRoll] = useState<{ attacker: string; defender: string; atkTotal: number; defTotal: number; atkRoll: number; defRoll: number; damage: number; result: string; defenseType: string } | null>(null);
  const [usedBattleAction, setUsedBattleAction] = useState(false);
  const [availableSimpleActions, setAvailableSimpleActions] = useState(COMBAT_SIMPLE_ACTIONS);
  const [fatalNarration, setFatalNarration] = useState<string>("");
  const [showFatalInput, setShowFatalInput] = useState(false);
  const [fatalTarget, setFatalTarget] = useState<string | null>(null);
  const [quickRoll, setQuickRoll] = useState<{ value: number; text: string; color: string } | null>(null);

  function addCharacterToCombat(char: CharacterBrief) {
    if (participants.some((p) => p.characterId === char.id)) return;
    const newParticipant: CombatParticipant = {
      id: `char-${char.id}`,
      name: char.name,
      type: "character",
      vida_atual: char.vida_atual,
      vida_max: char.vida_max,
      conditions: [...char.conditions],
      isPlayer: true,
      characterId: char.id,
      initiative: 0,
      attackMod: char.actions?.atacar ?? 0,
      defenseMod: char.actions?.defender ?? 0,
    };
    setParticipants((prev) => [...prev, newParticipant]);
    addLog(`${char.name} entrou em combate`);
  }

  let enemyIdCounter = 0;
  function addEnemyToCombat() {
    if (!enemyForm.name) return;
    enemyIdCounter++;
    const id = `enemy-${enemyIdCounter}`;
    const newParticipant: CombatParticipant = {
      id,
      name: enemyForm.name,
      type: "enemy",
      vida_atual: enemyForm.vida,
      vida_max: enemyForm.vida_max,
      conditions: [],
      enemyId: id,
      initiative: 0,
    };
    setParticipants((prev) => [...prev, newParticipant]);
    addLog(`${enemyForm.name} entrou em combate`);
  }

  function removeParticipant(id: string) {
    const p = participants.find((p) => p.id === id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    if (p) addLog(`${p.name} foi removido do combate`);
  }

  function updateVida(id: string, delta: number) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, vida_atual: Math.max(0, Math.min(p.vida_max, p.vida_atual + delta)) }
          : p,
      ),
    );
  }

  function addCondition(id: string, condition: Condition) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id && !p.conditions.includes(condition)
          ? { ...p, conditions: [...p.conditions, condition] }
          : p,
      ),
    );
    const p = participants.find((p) => p.id === id);
    if (p) addLog(`${p.name} agora está: ${CONDITION_EFFECTS[condition].label}`);
  }

  function removeCondition(id: string, condition: Condition) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, conditions: p.conditions.filter((c) => c !== condition) }
          : p,
      ),
    );
  }

  function startCombat() {
    if (participants.length < 2) return;
    const rolled = participants.map((p) => ({
      ...p,
      initiative: rollD10(),
    }));
    rolled.sort((a, b) => b.initiative - a.initiative);
    setParticipants(rolled);
    setCurrentTurnIndex(0);
    setRound(1);
    setIsActive(true);
    addLog("⚔️ Combate iniciado!");
    addLog(`Turno 1: ${rolled[0].name}`);
  }

  function nextTurn() {
    const nextIndex = (currentTurnIndex + 1) % participants.length;
    if (nextIndex === 0) {
      setRound((r) => r + 1);
    }
    setCurrentTurnIndex(nextIndex);
    setAttackRoll(null);
    setFatalNarration("");
    setShowFatalInput(false);
    setDefenderChoice(null);
    setPendingAttack(null);
    setUsedBattleAction(false);
    setAvailableSimpleActions(COMBAT_SIMPLE_ACTIONS);

    const next = participants[nextIndex];
    addLog(`Turno ${round + (nextIndex === 0 ? 1 : 0)}: ${next.name}`);

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.conditions.includes("sangrando")) {
          const newVida = Math.max(0, p.vida_atual - 1);
          addLog(`${p.name} perdeu 1 de Vida (sangrando)`);
          return { ...p, vida_atual: newVida };
        }
        return p;
      }),
    );
  }

  function addLog(msg: string) {
    setLog((prev) => [msg, ...prev.slice(0, 99)]);
  }

  function initiateAttack(attackerId: string, defenderId: string) {
    setPendingAttack({ attackerId, defenderId });
    setDefenderChoice(null);
    setAttackRoll(null);
    setSelectedAttacker(attackerId);
    setSelectedDefender(defenderId);
  }

  function resolveAttack(defenseType: "esquivar" | "defender") {
    if (!pendingAttack) return;
    const { attackerId, defenderId } = pendingAttack;

    const attacker = participants.find((p) => p.id === attackerId);
    const defender = participants.find((p) => p.id === defenderId);
    if (!attacker || !defender) return;

    const atkRoll = rollD10();
    const defRoll = rollD10();

    const atkMod = attacker.attackMod ?? 0;
    const defMod = defender.defenseMod ?? 0;

    const atkTotal = atkRoll + atkMod + (attacker.conditions.includes("adrenalina") ? 2 : 0) + (attacker.conditions.includes("tenso") ? -3 : 0);
    const defTotal = defRoll + defMod + (defender.conditions.includes("adrenalina") ? 2 : 0) + (defender.conditions.includes("tenso") ? -3 : 0);

    let damage = 0;
    let result = "";
    const defenseLabel = defenseType === "esquivar" ? "Esquiva" : "Defesa";

    // Auto-apply effects on natural rolls
    if (atkRoll === 10) {
      addCondition(attackerId, "adrenalina");
      addLog(`${attacker.name} tirou 10 natural! Ganhou Adrenalina.`);
    }
    if (atkRoll === 1) {
      addLog(`${attacker.name} tirou 1 natural! Ganha +1d6 PT.`);
    }

    const baseDamage = attacker.type === "enemy" ? "2d4" : DAMAGE_FORMULAS.desarmado;

    if (atkTotal > defTotal) {
      damage = rollDamage(baseDamage);
      if (atkRoll >= CRITICAL_HIT_THRESHOLD_MIN) {
        const critExtra = rollDamage("1d4");
        damage += critExtra;
        result += "CRÍTICO! ";
      }
      result += `${attacker.name} acertou ${defender.name} causando ${damage} de dano`;
      updateVida(defenderId, -damage);
    } else if (atkTotal === defTotal) {
      if (defenseType === "defender") {
        damage = rollDamage("1d4");
        result += `${attacker.name} acertou ${defender.name} causando ${damage} de dano (Defesa parcial)`;
        updateVida(defenderId, -damage);
      } else {
        damage = rollDamage(baseDamage);
        result += `${attacker.name} acertou ${defender.name} causando ${damage} de dano (Empate em Esquiva)`;
        updateVida(defenderId, -damage);
      }
    } else {
      result += `${defender.name} defendeu/escapou do ataque de ${attacker.name}`;
    }

    setAttackRoll({
      attacker: attacker.name,
      defender: defender.name,
      atkTotal,
      defTotal,
      atkRoll,
      defRoll,
      damage,
      result,
      defenseType: defenseLabel,
    });
    addLog(result);
    setUsedBattleAction(true);
    setDefenderChoice(defenseType);

    const defAfter = participants.find((p) => p.id === defenderId);
    if (defAfter && defAfter.vida_atual <= 0) {
      addLog(`${defender.name} foi derrotado!`);
    }
  }

  function isLowHealth(participantId: string): boolean {
    const p = participants.find((p) => p.id === participantId);
    if (!p) return false;
    return p.vida_atual <= p.vida_max * 0.25;
  }

  function handleFatalAttack(attackerId: string, defenderId: string) {
    if (!isLowHealth(defenderId)) {
      addLog("Inimigo não está com vida baixa o suficiente para um Ataque FATAL.");
      return;
    }
    setSelectedAttacker(attackerId);
    setSelectedDefender(defenderId);
    setFatalTarget(defenderId);
    setShowFatalInput(true);
  }

  function confirmFatalAttack() {
    if (!selectedAttacker || !selectedDefender) return;
    const attacker = participants.find((p) => p.id === selectedAttacker);
    const defender = participants.find((p) => p.id === selectedDefender);
    if (!attacker || !defender) return;

    const damage = rollDamage("3d6");
    updateVida(selectedDefender, -damage);
    const narration = fatalNarration || "Ataque FATAL!";
    addLog(`💀 ${attacker.name} executa um Ataque FATAL em ${defender.name}: "${narration}" causando ${damage} de dano! +2 PI!`);
    setAttackRoll({
      attacker: attacker.name,
      defender: defender.name,
      atkTotal: 999,
      defTotal: 0,
      atkRoll: 10,
      defRoll: 0,
      damage,
      defenseType: "FATAL",
      result: `💀 ATAQUE FATAL! ${narration}`,
    });
    setShowFatalInput(false);
    setFatalNarration("");
    setUsedBattleAction(true);
  }

  function rollDice(formula: string) {
    const match = formula.match(/^(\d+)d(\d+)(?:\+(\d+))?$/);
    if (!match) return;
    const count = Number.parseInt(match[1], 10);
    const sides = Number.parseInt(match[2], 10);
    const bonus = match[3] ? Number.parseInt(match[3], 10) : 0;
    const rolls = rollMultiple(count, sides);
    const total = rolls.reduce((a, b) => a + b, 0) + bonus;
    setQuickRoll({ value: total, text: `[${rolls.join(", ")}]${bonus ? ` +${bonus}` : ""} = ${total}`, color: "text-zinc-100" });
  }

  const currentParticipant = participants[currentTurnIndex];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link
        href={`/dashboard/campanha/${campaignId}`}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar para Campanha
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100">
            Combate — {campaignName}
          </h1>
          {isActive && (
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Rodada {round} · Turno de: <span className="text-zinc-300">{currentParticipant?.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {!isActive && participants.length >= 2 && (
            <button
              type="button"
              onClick={startCombat}
              className="flex items-center gap-2 border border-zinc-700 rounded-lg px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-green-400 hover:text-green-400 transition-all"
            >
              <Swords size={14} />
              Iniciar Combate
            </button>
          )}
          {isActive && (
            <button
              type="button"
              onClick={nextTurn}
              className="flex items-center gap-2 border border-zinc-700 rounded-lg px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all"
            >
              Próximo Turno
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Participants + Enemy Form */}
        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Participantes ({participants.length})
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {participants.map((p, i) => (
                <div
                  key={p.id}
                  className={`border rounded-lg p-3 transition-all ${
                    isActive && i === currentTurnIndex
                      ? "border-zinc-400 bg-zinc-900/80"
                      : "border-zinc-800 bg-zinc-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-200 font-mono flex items-center gap-1.5">
                      {p.type === "enemy" ? <Skull size={10} className="text-red-400" /> : <Swords size={10} className="text-blue-400" />}
                      {p.name}
                      {isActive && i === currentTurnIndex && (
                        <Zap size={10} className="text-yellow-400" />
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeParticipant(p.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <Heart size={10} className="text-green-400" />
                    <span className="text-green-400">{p.vida_atual}/{p.vida_max}</span>
                    {p.conditions.length > 0 && (
                      <span className="text-yellow-400">{p.conditions.length} cond.</span>
                    )}
                  </div>
                  {isActive && p.type === "character" && p.vida_atual > 0 && (
                    <div className="flex gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAttacker(p.id)}
                        disabled={usedBattleAction}
                        className="flex-1 border border-zinc-700 rounded text-[9px] py-1 text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Atacar {usedBattleAction ? "(já usou)" : ""}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const targets = participants.filter(t => t.id !== p.id && t.vida_atual > 0);
                          if (targets.length === 1) {
                            handleFatalAttack(p.id, targets[0].id);
                          }
                        }}
                        disabled={usedBattleAction}
                        className="flex-1 border border-red-900/50 rounded text-[9px] py-1 text-red-400 hover:border-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        FATAL
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add characters to combat */}
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
              Personagens
            </h2>
            <div className="space-y-1">
              {characters.map((char) => {
                const inCombat = participants.some((p) => p.characterId === char.id);
                return (
                  <button
                    key={char.id}
                    type="button"
                    disabled={inCombat}
                    onClick={() => addCharacterToCombat(char)}
                    className="w-full text-left border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-zinc-400 hover:border-zinc-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {char.name} {inCombat ? "(em combate)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add enemy form */}
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
            <button
              type="button"
              onClick={() => setShowEnemyForm(!showEnemyForm)}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3"
            >
              <Plus size={12} />
              Adicionar Inimigo
            </button>
            {showEnemyForm && (
              <div className="space-y-2">
                <input
                  value={enemyForm.name}
                  onChange={(e) => setEnemyForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
                  placeholder="Nome do inimigo"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-zinc-600">Vida</span>
                    <input
                      type="number"
                      value={enemyForm.vida}
                      onChange={(e) => setEnemyForm((f) => ({ ...f, vida: Number(e.target.value), vida_max: Number(e.target.value) }))}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-600">Defesa</span>
                    <input
                      type="number"
                      value={enemyForm.defesa}
                      onChange={(e) => setEnemyForm((f) => ({ ...f, defesa: Number(e.target.value) }))}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-600">PA</span>
                    <input
                      type="number"
                      value={enemyForm.pa}
                      onChange={(e) => setEnemyForm((f) => ({ ...f, pa: Number(e.target.value), pa_max: Number(e.target.value) }))}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-100"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-600">Tamanho</span>
                    <input
                      value={enemyForm.tamanho}
                      onChange={(e) => setEnemyForm((f) => ({ ...f, tamanho: e.target.value }))}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-100"
                    />
                  </div>
                </div>
                <input
                  value={enemyForm.ponto_fraco}
                  onChange={(e) => setEnemyForm((f) => ({ ...f, ponto_fraco: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
                  placeholder="Ponto fraco (opcional)"
                />
                <button
                  type="button"
                  onClick={addEnemyToCombat}
                  disabled={!enemyForm.name}
                  className="w-full border border-zinc-700 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-50"
                >
                  Adicionar ao Combate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main combat area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Attack resolution */}
          {isActive && selectedAttacker && !pendingAttack && !showFatalInput && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
                Resolver Ataque
              </h2>
              <p className="text-xs text-zinc-500 font-mono mb-3">
                Atacante: {participants.find((p) => p.id === selectedAttacker)?.name}
                {usedBattleAction && <span className="text-yellow-400 ml-2">(ação de batalha já usada)</span>}
              </p>
              {!usedBattleAction && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-mono mb-2">Escolha o alvo:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {participants
                      .filter((p) => p.id !== selectedAttacker && p.vida_atual > 0)
                      .map((target) => (
                        <button
                          key={target.id}
                          type="button"
                          onClick={() => initiateAttack(selectedAttacker, target.id)}
                          className="border border-zinc-800 rounded-lg p-3 text-left hover:border-zinc-600 transition-all"
                        >
                          <span className="text-xs text-zinc-200 font-mono">{target.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono block">
                            Vida: {target.vida_atual}/{target.vida_max}
                            {target.type === "enemy" && isLowHealth(target.id) && (
                              <span className="text-red-400 ml-1">[Pouca Vida]</span>
                            )}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Defender choice step */}
          {isActive && pendingAttack && !defenderChoice && !showFatalInput && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">
                Defesa — {participants.find((p) => p.id === pendingAttack.defenderId)?.name}
              </h2>
              <p className="text-xs text-zinc-500 font-mono mb-3">
                Como {participants.find((p) => p.id === pendingAttack.defenderId)?.name} vai se defender?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => resolveAttack("esquivar")}
                  className="flex-1 border border-blue-700 rounded-lg px-4 py-3 text-xs text-blue-300 hover:border-blue-500 transition-all font-mono"
                >
                  Esquivar (empate = atacante acerta)
                </button>
                <button
                  type="button"
                  onClick={() => resolveAttack("defender")}
                  className="flex-1 border border-green-700 rounded-lg px-4 py-3 text-xs text-green-300 hover:border-green-500 transition-all font-mono"
                >
                  Defender (empate = metade do dano)
                </button>
              </div>
            </div>
          )}

          {/* Attack result */}
          {attackRoll && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-4">Resultado do Ataque</h2>
              <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
                <div className="grid grid-cols-2 gap-4 mb-3 text-[10px] font-mono">
                  <div>
                    <span className="text-zinc-500">Atacante:</span>
                    <span className="text-zinc-200 ml-2">{attackRoll.attacker}</span>
                    <span className="text-zinc-500 ml-2">({attackRoll.atkRoll})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Defesa ({attackRoll.defenseType}):</span>
                    <span className="text-zinc-200 ml-2">{attackRoll.defender}</span>
                    <span className="text-zinc-500 ml-2">({attackRoll.defRoll})</span>
                  </div>
                </div>
                <p className="text-xs font-mono text-zinc-300">{attackRoll.result}</p>
              </div>
            </div>
          )}

          {showFatalInput && (
            <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
              <p className="text-xs text-red-400 font-mono mb-2">💀 Ataque FATAL — Narre seu golpe:</p>
              <textarea
                value={fatalNarration}
                onChange={(e) => setFatalNarration(e.target.value)}
                rows={3}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors resize-none mb-3"
                placeholder="Descreva como seu personagem finaliza o inimigo..."
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmFatalAttack}
                  className="border border-red-700 rounded-lg px-4 py-2 text-xs text-red-300 hover:border-red-500 hover:text-red-200 transition-all"
                >
                  Confirmar FATAL
                </button>
                <button
                  type="button"
                  onClick={() => setShowFatalInput(false)}
                  className="border border-zinc-700 rounded-lg px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Condition controls */}
          {isActive && currentParticipant && (
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
                Condições — {currentParticipant.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(["sangrando", "atordoado", "machucado", "apavorado", "camuflado", "pesado", "adrenalina", "tenso"] as Condition[]).map((c) => {
                  const active = currentParticipant.conditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => active ? removeCondition(currentParticipant.id, c) : addCondition(currentParticipant.id, c)}
                      className={`text-[10px] px-2.5 py-1 rounded font-mono border transition-all ${
                        active
                          ? "bg-yellow-400/10 border-yellow-600/50 text-yellow-300"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      {CONDITION_EFFECTS[c].label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick dice roller */}
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
            <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2">
              <Dice1 size={12} /> Rolagem Rápida
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {["1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "3d4", "1d10+2"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => rollDice(f)}
                  className="border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
                >
                  {f}
                </button>
              ))}
            </div>
            {quickRoll && (
              <p className="text-xs font-mono text-zinc-300">{quickRoll.text}</p>
            )}
          </div>
        </div>

        {/* Combat log */}
        <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Registro
          </h2>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {log.map((entry, i) => (
              <p key={i} className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                {entry}
              </p>
            ))}
            {log.length === 0 && (
              <p className="text-[10px] text-zinc-700 font-mono">Nenhum evento ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
