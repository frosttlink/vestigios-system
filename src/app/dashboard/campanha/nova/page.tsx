"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NovaCampanhaPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error, data } = await supabase
      .from("campanhas")
      .insert({
        master_id: user.id,
        name,
        description,
        characters: [],
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("Erro: " + error.message);
      return;
    }

    router.push(`/dashboard/campanha/${data.id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-8">
        Nova Campanha
      </h1>

      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            Nome da Campanha
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="Ex: O Mistério da Mansão"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            placeholder="Uma breve descrição da campanha..."
          />
        </div>

        <button
          type="submit"
          disabled={saving || !name}
          className="w-full border border-zinc-700 rounded-lg px-6 py-3 text-sm uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Criando..." : "Criar Campanha"}
        </button>
      </form>
    </div>
  );
}
