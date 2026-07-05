import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default async function CampanhaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campanhas")
    .select("*")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const { data: characters } = await supabase
    .from("personagens")
    .select("*")
    .in("id", campaign.characters ?? []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard/campanha"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-2">
        {campaign.name}
      </h1>
      <p className="text-xs text-zinc-500 font-mono mb-8">{campaign.description}</p>

      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-zinc-400" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Personagens ({characters?.length ?? 0})
          </h2>
        </div>

        {(!characters || characters.length === 0) ? (
          <p className="text-xs text-zinc-600 font-mono">
            Nenhum personagem adicionado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {characters.map((char) => (
              <Link
                key={char.id}
                href={`/dashboard/ficha/${char.id}`}
                className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-all"
              >
                <span className="text-sm text-zinc-200 font-mono">{char.name}</span>
                <span className="text-[10px] text-zinc-600 font-mono block mt-1">
                  Vida: {char.vida_atual}/{char.vida_max} | Mente: {char.mente_atual}/{char.mente_max}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
