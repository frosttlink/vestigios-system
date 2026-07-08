import { createClient } from "@/lib/supabase/server";
import type { Campaign } from "@/lib/types";
import { BookOpen, Plus, Users, Swords } from "lucide-react";
import Link from "next/link";

export default async function CampanhaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campanhas")
    .select("*")
    .eq("master_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: memberCampaigns } = await supabase
    .from("campanha_membros")
    .select("campanha_id, campanhas!inner(*)")
    .eq("user_id", user!.id);

  const memberCampaignData = (memberCampaigns
    ?.filter((m) => m.campanhas)
    .map((m) => m.campanhas) ?? []) as unknown as Campaign[];

  const allCampaigns = [...(campaigns ?? []), ...memberCampaignData];
  const uniqueCampaigns = allCampaigns.filter(
    (camp, i, arr) => arr.findIndex((c) => c.id === camp.id) === i,
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100">
          Campanhas
        </h1>
        <Link
          href="/dashboard/campanha/nova"
          className="flex items-center gap-2 border border-zinc-700 rounded-lg px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300 self-stretch sm:self-auto justify-center"
        >
          <Plus size={14} />
          Nova Campanha
        </Link>
      </div>

      {uniqueCampaigns.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-12 text-center bg-zinc-950/50">
          <BookOpen size={32} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-sm text-zinc-500 font-mono mb-2">
            Nenhuma campanha criada ainda
          </p>
          <p className="text-xs text-zinc-700 font-mono mb-6">
            Crie uma campanha para reunir seus personagens
          </p>
          <Link
            href="/dashboard/campanha/nova"
            className="inline-block border border-zinc-700 rounded-lg px-6 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300"
          >
            Criar Campanha
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns && campaigns.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 flex items-center gap-2">
                <Swords size={12} /> Mestrando
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp) => (
                  <Link
                    key={camp.id}
                    href={`/dashboard/campanha/${camp.id}`}
                    className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 hover:border-zinc-600 transition-all duration-300"
                  >
                    <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-100 mb-2">
                      {camp.name}
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mb-3 line-clamp-2">
                      {camp.description}
                    </p>
                    <p className="text-[10px] text-zinc-700 font-mono">
                      {camp.characters?.length ?? 0} personagens
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {memberCampaignData.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 flex items-center gap-2">
                <Users size={12} /> Participando
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberCampaignData.map((camp) => (
                  <Link
                    key={camp.id}
                    href={`/dashboard/campanha/${camp.id}`}
                    className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 hover:border-zinc-600 transition-all duration-300"
                  >
                    <h2 className="text-sm uppercase tracking-[0.2em] text-zinc-100 mb-2">
                      {camp.name}
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mb-3 line-clamp-2">
                      {camp.description}
                    </p>
                    <span className="text-[10px] text-zinc-600 font-mono">Como jogador</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
