"use client";

import { useState } from "react";
import { Skull, Plus, Trash2 } from "lucide-react";

interface EnemyForm {
  name: string;
  vida: number;
  defesa: number;
  pa: number;
  tamanho: string;
  caracteristicas: string;
  ponto_fraco: string;
}

export default function MestrePage() {
  const [enemies, setEnemies] = useState<EnemyForm[]>([]);

  function addEnemy() {
    setEnemies((prev) => [
      ...prev,
      {
        name: "",
        vida: 20,
        defesa: 10,
        pa: 50,
        tamanho: "Médio",
        caracteristicas: "",
        ponto_fraco: "",
      },
    ]);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-8">
        Escudo do Mestre
      </h1>

      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Inimigos e Ameaças
          </h2>
          <button
            type="button"
            onClick={addEnemy}
            className="flex items-center gap-2 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-zinc-400 hover:border-zinc-400 hover:text-white transition-all"
          >
            <Plus size={12} />
            Adicionar
          </button>
        </div>

        {enemies.length === 0 ? (
          <div className="text-center py-8">
            <Skull size={24} className="mx-auto mb-2 text-zinc-700" />
            <p className="text-xs text-zinc-600 font-mono">
              Nenhum inimigo adicionado. Use o botão acima para adicionar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {enemies.map((enemy, i) => (
              <div
                key={i}
                className="border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <input
                    value={enemy.name}
                    onChange={(e) => {
                      const updated = [...enemies];
                      updated[i] = { ...enemy, name: e.target.value };
                      setEnemies(updated);
                    }}
                    className="bg-transparent text-sm text-zinc-200 font-mono uppercase tracking-[0.1em] border-none focus:outline-none"
                    placeholder="Nome do inimigo"
                  />
                  <button
                    type="button"
                    onClick={() => setEnemies((prev) => prev.filter((_, j) => j !== i))}
                    className="text-zinc-700 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-zinc-600 block text-[10px]">Vida</span>
                    <input
                      type="number"
                      value={enemy.vida}
                      onChange={(e) => {
                        const updated = [...enemies];
                        updated[i] = { ...enemy, vida: Number(e.target.value) };
                        setEnemies(updated);
                      }}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <span className="text-zinc-600 block text-[10px]">Defesa</span>
                    <input
                      type="number"
                      value={enemy.defesa}
                      onChange={(e) => {
                        const updated = [...enemies];
                        updated[i] = { ...enemy, defesa: Number(e.target.value) };
                        setEnemies(updated);
                      }}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <span className="text-zinc-600 block text-[10px]">PA</span>
                    <input
                      type="number"
                      value={enemy.pa}
                      onChange={(e) => {
                        const updated = [...enemies];
                        updated[i] = { ...enemy, pa: Number(e.target.value) };
                        setEnemies(updated);
                      }}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <span className="text-zinc-600 block text-[10px]">Tamanho</span>
                    <input
                      value={enemy.tamanho}
                      onChange={(e) => {
                        const updated = [...enemies];
                        updated[i] = { ...enemy, tamanho: e.target.value };
                        setEnemies(updated);
                      }}
                      className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-zinc-100"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-zinc-600 block text-[10px] font-mono">Ponto Fraco</span>
                  <input
                    value={enemy.ponto_fraco}
                    onChange={(e) => {
                      const updated = [...enemies];
                      updated[i] = { ...enemy, ponto_fraco: e.target.value };
                      setEnemies(updated);
                    }}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono mt-1"
                    placeholder="Ex: Fogo, Luz, Prata..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
