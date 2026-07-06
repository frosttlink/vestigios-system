"use client";

import { useState } from "react";
import type { Role } from "@/lib/types";
import { ROLES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { rollDamage } from "@/lib/dice";
import { Swords } from "lucide-react";

interface Props {
  characterId: string;
  role: Role | null;
  pi: number;
  pt: number;
  onUpdate: (pi: number, pt: number) => void;
}

export function RoleAbility({ characterId, role, pi, pt, onUpdate }: Props) {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [psicoInput, setPsicoInput] = useState(1);
  const [sessionUsed, setSessionUsed] = useState(false);

  const roleInfo = role ? ROLES.find((r) => r.key === role) : null;
  if (!roleInfo) return null;

  async function useAbility() {
    if (!role || !roleInfo) return;

    const supabase = createClient();
    let newPi = pi;
    let newPt = pt;
    let result = "";

    switch (role) {
      case "medico": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        const heal = rollDamage("3d4");
        result = `Cura aplicada: +${heal} de Vida. Gaste os PI e adicione a cura.`;
        newPi -= 3;
        break;
      }
      case "policial": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "+4 em Disparar no próximo teste! Anote o bônus.";
        newPi -= 3;
        break;
      }
      case "detetive": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "+4 em Compreender e Analisar no próximo teste! Anote o bônus.";
        newPi -= 3;
        break;
      }
      case "hacker": {
        if (pi < 2) { setLastResult("PI insuficiente (2 PI)"); return; }
        result = "Pista digital encontrada! O mestre deve fornecer uma informação.";
        newPi -= 2;
        break;
      }
      case "jornalista": {
        if (pi < 2) { setLastResult("PI insuficiente (2 PI)"); return; }
        result = "Contato útil conseguido! O mestre deve fornecer um contato.";
        newPi -= 2;
        break;
      }
      case "engenheiro": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "Item improvisado criado/consertado! O mestre decide o resultado.";
        newPi -= 3;
        break;
      }
      case "sentinela": {
        const sentCost = Math.min(Math.max(pi, 3), 6);
        newPi -= sentCost;
        newPt += 2;
        result = `Poder sobrenatural ativado! Gastou ${sentCost} PI. +2 PT em batalha.`;
        break;
      }
      case "bombeiro": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "Alguém foi salvo do perigo automaticamente! Sem necessidade de teste.";
        newPi -= 3;
        break;
      }
      case "cientista": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "Fenômeno/criatura analisado(a) com sucesso! O mestre revela informações.";
        newPi -= 3;
        break;
      }
      case "sobrevivente": {
        if (sessionUsed) { setLastResult("Já usou esta sessão! Só 1x por sessão."); return; }
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "Água/comida/abrigo encontrado! Sem necessidade de teste.";
        newPi -= 3;
        setSessionUsed(true);
        break;
      }
      case "psicologo": {
        const removePt = Math.min(psicoInput, pi, pt);
        if (removePt <= 0) { setLastResult("PI insuficiente ou PT já zerado."); return; }
        newPt -= removePt;
        newPi -= removePt;
        result = `${removePt} PT removido de um aliado!`;
        break;
      }
      case "esportista": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "+5 em Mobilidade no próximo teste! Anote o bônus.";
        newPi -= 3;
        break;
      }
      case "lutador": {
        if (pi < 4) { setLastResult("PI insuficiente (4 PI)"); return; }
        result = "Ataques desarmados causam 3d4 até o fim da cena! Anote o bônus.";
        newPi -= 4;
        break;
      }
      case "explorador": {
        if (pi < 3) { setLastResult("PI insuficiente (3 PI)"); return; }
        result = "Teste de Jornada passado automaticamente!";
        newPi -= 3;
        break;
      }
    }

    if (result && newPi !== pi) {
      await supabase.from("personagens").update({ pi: newPi, pt: newPt }).eq("id", characterId);
      onUpdate(newPi, newPt);
    }
    setLastResult(result);
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
            <Swords size={12} /> Função: {roleInfo.label}
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">{roleInfo.ability}</p>
        </div>
        <button
          type="button"
          onClick={useAbility}
          disabled={roleInfo.piCost ? pi < roleInfo.piCost : false}
          className="border border-zinc-700 rounded-lg px-3 py-2 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Usar
        </button>
      </div>

      {role === "psicologo" && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-zinc-600 font-mono">Remover PT:</span>
          <input
            type="number"
            min={1}
            max={Math.min(pi, pt)}
            value={psicoInput}
            onChange={(e) => setPsicoInput(Math.max(1, Number(e.target.value)))}
            className="w-16 bg-black border border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-zinc-100"
          />
        </div>
      )}

      {lastResult && (
        <div className="text-[10px] text-zinc-300 font-mono bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2">
          {lastResult}
        </div>
      )}
    </div>
  );
}
