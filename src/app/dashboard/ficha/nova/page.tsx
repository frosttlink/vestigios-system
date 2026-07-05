"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOMAINS, ACTIONS, ROLES, DOMAIN_MAX, DOMAIN_TOTAL, ACTION_MAX, ACTION_TOTAL, INITIAL_PI } from "@/lib/constants";
import type { Action, Domain, Role } from "@/lib/types";
import { calculateLife, calculateMind } from "@/lib/dice";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = ["Identidade", "Domínios", "Ações", "Função", "Revisão"];

export default function NovaFichaPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    backstory: "",
    fears: "",
  });

  const [domains, setDomains] = useState<Record<Domain, number>>({
    forca: 0,
    velocidade: 0,
    resistencia: 0,
    sabedoria: 0,
    carisma: 0,
  });

  const [actions, setActions] = useState<Record<Action, number>>(
    Object.fromEntries(ACTIONS.map((a) => [a.key, 0])) as Record<Action, number>,
  );

  const [role, setRole] = useState<Role | null>(null);

  const domainTotal = Object.values(domains).reduce((a, b) => a + b, 0);
  const actionTotal = Object.values(actions).reduce((a, b) => a + b, 0);
  const vidaMax = calculateLife(domains.forca, domains.velocidade, domains.resistencia);
  const menteMax = calculateMind(domains.sabedoria, domains.resistencia, domains.carisma);

  function updateDomain(key: Domain, value: number) {
    setDomains((prev) => ({ ...prev, [key]: Math.max(0, Math.min(DOMAIN_MAX, value)) }));
  }

  function updateAction(key: Action, value: number) {
    setActions((prev) => ({ ...prev, [key]: Math.max(0, Math.min(ACTION_MAX, value)) }));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("personagens").insert({
      user_id: user.id,
      name: form.name,
      description: form.description,
      backstory: form.backstory,
      fears: form.fears,
      ...domains,
      actions,
      role,
      pi: INITIAL_PI,
      pt: 0,
      vida_max: vidaMax,
      mente_max: menteMax,
      vida_atual: vidaMax,
      mente_atual: menteMax,
      inventory: [],
      equipment: [],
      conditions: [],
      traumas: [],
      powers: [],
    });

    setSaving(false);

    if (error) {
      alert("Erro ao salvar: " + error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-6">
          Nova Ficha
        </h1>

        <div className="flex gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= step ? "bg-zinc-400" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-zinc-500 font-mono">
          Etapa {step + 1} de {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      {step === 0 && (
        <div className="space-y-6 animate-fade-slide-up">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Nome do Personagem
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              placeholder="Aparência, idade, características..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              História
            </label>
            <textarea
              value={form.backstory}
              onChange={(e) => setForm((f) => ({ ...f, backstory: e.target.value }))}
              rows={4}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              placeholder="O que fez até chegar aqui? Por que está fazendo isso?"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Medos
            </label>
            <textarea
              value={form.fears}
              onChange={(e) => setForm((f) => ({ ...f, fears: e.target.value }))}
              rows={3}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              placeholder="Qual o maior medo do seu personagem?"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 font-mono">
              Distribua {DOMAIN_TOTAL} pontos (máx. {DOMAIN_MAX} por domínio)
            </p>
            <span className={`text-xs font-mono ${domainTotal !== DOMAIN_TOTAL ? "text-yellow-400" : "text-green-400"}`}>
              {domainTotal}/{DOMAIN_TOTAL}
            </span>
          </div>

          {DOMAINS.map((d) => (
            <div key={d.key} className="border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm uppercase tracking-[0.15em] text-zinc-200">
                    {d.label}
                  </span>
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                    {d.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateDomain(d.key, domains[d.key] - 1)}
                    disabled={domains[d.key] === 0}
                    className="w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-mono text-zinc-100 w-6 text-center">
                    {domains[d.key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateDomain(d.key, domains[d.key] + 1)}
                    disabled={domains[d.key] >= DOMAIN_MAX || domainTotal >= DOMAIN_TOTAL}
                    className="w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 font-mono">
              Distribua {ACTION_TOTAL} pontos (máx. {ACTION_MAX} por ação)
            </p>
            <span className={`text-xs font-mono ${actionTotal !== ACTION_TOTAL ? "text-yellow-400" : "text-green-400"}`}>
              {actionTotal}/{ACTION_TOTAL}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map((a) => (
              <div key={a.key} className="border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.1em] text-zinc-300">
                  {a.label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateAction(a.key, actions[a.key] - 1)}
                    disabled={actions[a.key] === 0}
                    className="w-6 h-6 rounded border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                  >
                    -
                  </button>
                  <span className="text-sm font-mono text-zinc-100 w-4 text-center">
                    {actions[a.key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateAction(a.key, actions[a.key] + 1)}
                    disabled={actions[a.key] >= ACTION_MAX || actionTotal >= ACTION_TOTAL}
                    className="w-6 h-6 rounded border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-slide-up">
          <p className="text-xs text-zinc-500 font-mono mb-4">
            Escolha a função do seu personagem
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`text-left border rounded-lg p-4 transition-all duration-300 ${
                  role === r.key
                    ? "border-zinc-400 bg-zinc-900/80"
                    : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600"
                }`}
              >
                <div className="text-sm uppercase tracking-[0.15em] text-zinc-200 mb-1">
                  {r.label}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                  {r.ability}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-fade-slide-up">
          <div className="border border-zinc-800 rounded-xl p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Nome
              </span>
              <p className="text-sm text-zinc-200 font-mono mt-1">{form.name || "—"}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Domínios
              </span>
              <div className="flex gap-3 mt-1">
                {DOMAINS.map((d) => (
                  <span key={d.key} className="text-xs text-zinc-300 font-mono">
                    {d.label}: {domains[d.key]}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Função
              </span>
              <p className="text-sm text-zinc-200 font-mono mt-1">
                {role ? ROLES.find((r) => r.key === role)?.label : "Nenhuma"}
              </p>
            </div>

            <div className="flex gap-8 pt-4 border-t border-zinc-800">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Vida
                </span>
                <p className="text-lg text-green-400 font-mono">{vidaMax}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Mente
                </span>
                <p className="text-lg text-blue-400 font-mono">{menteMax}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  PI
                </span>
                <p className="text-lg text-yellow-400 font-mono">{INITIAL_PI}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !form.name}
            className="w-full border border-zinc-700 rounded-lg px-6 py-4 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : "Criar Personagem"}
          </button>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
          Anterior
        </button>

        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Próximo
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
