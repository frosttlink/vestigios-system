"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Edit3, Trash2 } from "lucide-react";

interface Props {
  campaignId: string;
  campaignName: string;
  campaignDescription: string;
}

export function CampaignActions({ campaignId, campaignName, campaignDescription }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(campaignName);
  const [description, setDescription] = useState(campaignDescription);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("campanhas").update({ name, description }).eq("id", campaignId);
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("campanhas").delete().eq("id", campaignId);
    router.push("/dashboard/campanha");
  }

  if (editing) {
    return (
      <div className="space-y-3 w-full">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm font-mono text-zinc-100"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 resize-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="border border-zinc-700 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
      >
        <Edit3 size={12} /> Editar
      </button>
      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-red-400 font-mono">Excluir {campaignName}?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="border border-red-700 rounded px-2 py-1 text-[9px] font-mono text-red-300 hover:bg-red-900/30 transition-all"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="border border-zinc-700 rounded px-2 py-1 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-all"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1.5 border border-red-900/50 rounded-lg px-3 py-2 text-[10px] font-mono text-red-400 hover:border-red-500 transition-all"
        >
          <Trash2 size={12} /> Excluir
        </button>
      )}
    </div>
  );
}
