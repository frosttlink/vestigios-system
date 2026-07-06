import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CombatManager } from "./combat-manager";

export default async function CombatePage({
  params,
}: {
  params: Promise<{ campanha_id: string }>;
}) {
  const { campanha_id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campanhas")
    .select("*")
    .eq("id", campanha_id)
    .single();

  if (!campaign) notFound();

  const { data: members } = await supabase
    .from("campanha_membros")
    .select("*")
    .eq("campanha_id", campanha_id);

  const characterIds = members?.filter((m) => m.character_id).map((m) => m.character_id) ?? [];

  const { data: characters } = characterIds.length > 0
    ? await supabase
        .from("personagens")
        .select("id, name, vida_atual, vida_max, conditions, forca, velocidade, resistencia, sabedoria, carisma, actions, role, pt")
        .in("id", characterIds)
    : { data: [] };

  return (
    <CombatManager
      campaignId={campanha_id}
      campaignName={campaign.name}
      characters={(characters ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        vida_atual: c.vida_atual,
        vida_max: c.vida_max,
        conditions: c.conditions ?? [],
        forca: c.forca,
        velocidade: c.velocidade,
        resistencia: c.resistencia,
        sabedoria: c.sabedoria,
        carisma: c.carisma,
        actions: c.actions ?? {},
        role: c.role,
        pt: c.pt,
      }))}
    />
  );
}
