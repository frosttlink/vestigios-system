"use client";

import { useState } from "react";
import type { SupernaturalPower } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Plus, Trash2 } from "lucide-react";

interface Props {
  characterId: string;
  initialPowers: SupernaturalPower[];
  onUpdate: (powers: SupernaturalPower[]) => void;
}

export function PowersSection({ characterId, initialPowers, onUpdate }: Props) {
  const [powers, setPowers] = useState<SupernaturalPower[]>(initialPowers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SupernaturalPower>({
    name: "",
    type: "magia",
    description: "",
    effect: "",
    cost: {},
  });

  const powerTypes = [
    { key: "magia" as const, label: "Magia", desc: "Manipulação da natureza através de estudo e fé. Requer ingredientes." },
    { key: "ritual" as const, label: "Ritual", desc: "Distorce a realidade através de valores simbólicos e entidades. Desgasta a mente." },
    { key: "alquimia" as const, label: "Alquimia", desc: "Transmutação baseada em troca equivalente. Requer conhecimento da estrutura interna." },
  ];

  async function persist(updated: SupernaturalPower[]) {
    const supabase = createClient();
    await supabase.from("personagens").update({ powers: updated }).eq("id", characterId);
  }

  function addPower() {
    if (!form.name) return;
    const updated = [...powers, { ...form }];
    setPowers(updated);
    setForm({ name: "", type: "magia", description: "", effect: "", cost: {} });
    setShowForm(false);
    persist(updated);
    onUpdate(updated);
  }

  function removePower(index: number) {
    const updated = powers.filter((_, i) => i !== index);
    setPowers(updated);
    persist(updated);
    onUpdate(updated);
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <Sparkles size={12} /> Poderes Sobrenaturais
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 border border-zinc-800 rounded px-2.5 py-1 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
        >
          <Plus size={10} /> Adicionar
        </button>
      </div>

      {powers.length > 0 && (
        <div className="space-y-2">
          {powers.map((power, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm text-zinc-200 font-mono">{power.name}</span>
                  <span className="text-[10px] text-zinc-600 font-mono ml-2 uppercase">
                    {powerTypes.find((t) => t.key === power.type)?.label}
                  </span>
                </div>
                <button type="button" onClick={() => removePower(i)} className="text-zinc-700 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-2">{power.description}</p>
              <p className="text-[10px] text-zinc-400 font-mono">
                <span className="text-zinc-600">Efeito:</span> {power.effect}
              </p>
              {power.cost && (power.cost.pi || power.cost.mente || power.cost.ingredients) && (
                <div className="flex gap-3 mt-1 text-[9px] text-zinc-600 font-mono">
                  {power.cost.pi && <span>PI: {power.cost.pi}</span>}
                  {power.cost.mente && <span>Mente: {power.cost.mente}</span>}
                  {power.cost.ingredients && <span>Ingredientes: {power.cost.ingredients}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {powers.length === 0 && !showForm && (
        <p className="text-[10px] text-zinc-700 font-mono">Nenhum poder ainda.</p>
      )}

      {showForm && (
        <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100"
            placeholder="Nome do poder"
          />
          <div className="flex gap-2">
            {powerTypes.map((pt) => (
              <button
                key={pt.key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: pt.key }))}
                className={`flex-1 border rounded px-2 py-2 text-[9px] font-mono text-left transition-all ${
                  form.type === pt.key
                    ? "border-zinc-500 bg-zinc-900 text-zinc-200"
                    : "border-zinc-800 text-zinc-600 hover:border-zinc-600"
                }`}
              >
                <div className="uppercase tracking-[0.1em]">{pt.label}</div>
                <div className="text-[8px] mt-0.5 opacity-70">{pt.desc}</div>
              </button>
            ))}
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-zinc-100 resize-none"
            placeholder="Descrição do poder"
          />
          <textarea
            value={form.effect}
            onChange={(e) => setForm((f) => ({ ...f, effect: e.target.value }))}
            rows={2}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-zinc-100 resize-none"
            placeholder="Efeito mecânico"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={form.cost?.pi ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, cost: { ...f.cost, pi: e.target.value ? Number(e.target.value) : undefined } }))}
              className="bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
              placeholder="Custo PI"
            />
            <input
              type="number"
              value={form.cost?.mente ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, cost: { ...f.cost, mente: e.target.value ? Number(e.target.value) : undefined } }))}
              className="bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
              placeholder="Custo Mente"
            />
            <input
              value={form.cost?.ingredients ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, cost: { ...f.cost, ingredients: e.target.value || undefined } }))}
              className="bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
              placeholder="Ingredientes"
            />
          </div>
          <button
            type="button"
            onClick={addPower}
            disabled={!form.name}
            className="w-full border border-zinc-700 rounded px-3 py-2 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-50"
          >
            Adicionar Poder
          </button>
        </div>
      )}
    </div>
  );
}
