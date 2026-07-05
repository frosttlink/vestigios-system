import { createClient } from "@/lib/supabase/server";
import { CharacterGrid } from "@/components/ficha/character-grid";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: characters } = await supabase
    .from("personagens")
    .select("*")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100">
            Meus Personagens
          </h1>
          <p className="text-xs text-zinc-600 mt-1 font-mono">
            {characters?.length ?? 0} personagem(ns) criado(s)
          </p>
        </div>
        <Link
          href="/dashboard/ficha/nova"
          className="flex items-center gap-2 border border-zinc-700 rounded-lg px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300"
        >
          <Plus size={14} />
          Nova Ficha
        </Link>
      </div>

      <CharacterGrid characters={characters ?? []} />
    </div>
  );
}
