import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Shield, Swords } from "lucide-react";
import { InviteSection } from "./invite-section";
import { CampaignActions } from "./campaign-actions";
import { CONDITION_EFFECTS } from "@/lib/constants";

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

  const { data: { user } } = await supabase.auth.getUser();
  const isMaster = user!.id === campaign.master_id;

  const { data: members } = await supabase
    .from("campanha_membros")
    .select("*")
    .eq("campanha_id", id);

  const characterIds = members?.filter((m) => m.character_id).map((m) => m.character_id) ?? [];

  const { data: memberCharacters } = characterIds.length > 0
    ? await supabase
        .from("personagens")
        .select("id, name, role, vida_atual, vida_max, mente_atual, mente_max, pt, conditions, forca, velocidade, resistencia, sabedoria, carisma")
        .in("id", characterIds)
    : { data: [] };

  const charMap = new Map((memberCharacters ?? []).map((c) => [c.id, c]));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/dashboard/campanha"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-1">
            {campaign.name}
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            {campaign.description || "Sem descrição"}
          </p>
          <p className="text-[10px] text-zinc-700 font-mono mt-1">
            {isMaster ? "Mestre" : "Jogador"} · {members?.length ?? 0} membro(s)
          </p>
        </div>
        {isMaster && (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full sm:w-auto">
            <div className="flex gap-3 w-full sm:w-auto">
              <InviteSection campaignId={id} />
              <Link
                href={`/dashboard/combate/${id}`}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-zinc-700 rounded-lg px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300"
              >
                <Swords size={14} />
                Combate
              </Link>
            </div>
            <CampaignActions
              campaignId={id}
              campaignName={campaign.name}
              campaignDescription={campaign.description || ""}
            />
          </div>
        )}
      </div>

      {isMaster && (
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50 mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2">
            <Shield size={12} /> Escudo do Mestre — Personagens da Campanha
          </h2>
          {(!members || members.length === 0) ? (
            <p className="text-xs text-zinc-600 font-mono">
              Nenhum jogador nesta campanha ainda. Compartilhe o link de convite!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {members.map((member) => {
                const char = member.character_id ? charMap.get(member.character_id) : null;
                return (
                  <div
                    key={member.id}
                    className="border border-zinc-800 rounded-lg p-4"
                  >
                    <span className="text-sm text-zinc-200 font-mono block">
                      {char?.name ?? "Personagem não vinculado"}
                    </span>
                      {char && (
                        <div className="mt-2 space-y-1 text-[10px] font-mono">
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <span className="text-green-400">Vida: {char.vida_atual}/{char.vida_max}</span>
                            <span className="text-blue-400">Mente: {char.mente_atual}/{char.mente_max}</span>
                            <span className="text-red-400">PT: {char.pt}</span>
                          </div>
                        {char.role && (
                          <span className="text-zinc-500">Função: {char.role}</span>
                        )}
                        {char.conditions && char.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {char.conditions.map((c: string) => (
                              <span key={c} className="text-[9px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-zinc-600 flex gap-2">
                          <span>F:{char.forca}</span>
                          <span>V:{char.velocidade}</span>
                          <span>R:{char.resistencia}</span>
                          <span>S:{char.sabedoria}</span>
                          <span>C:{char.carisma}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-zinc-400" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Jogadores ({members?.length ?? 0})
          </h2>
        </div>

        {(!members || members.length === 0) ? (
          <p className="text-xs text-zinc-600 font-mono">
            Nenhum jogador adicionado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((member) => {
              const char = member.character_id ? charMap.get(member.character_id) : null;
              return (
                <div
                  key={member.id}
                  className="border border-zinc-800 rounded-lg p-4"
                >
                  <span className="text-sm text-zinc-200 font-mono">
                    {char?.name ?? "Aguardando personagem..."}
                  </span>
                  {char && (
                    <span className="text-[10px] text-zinc-600 font-mono block mt-1">
                      Vida: {char.vida_atual}/{char.vida_max} | Mente: {char.mente_atual}/{char.mente_max} | PT: {char.pt}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
