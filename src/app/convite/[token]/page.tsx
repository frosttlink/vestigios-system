import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Campaign } from "@/lib/types";
import { AcceptInviteForm } from "./accept-invite-form";

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invite } = await supabase
    .from("campanha_convites")
    .select("*, campanhas!inner(*)")
    .eq("token", token)
    .single();

  if (!invite || invite.usado) {
    notFound();
  }

  const campaign = invite.campanhas as unknown as Campaign;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/convite/${token}`);
  }

  if (user.id === campaign.master_id) {
    redirect(`/dashboard/campanha/${campaign.id}`);
  }

  const { data: existingMember } = await supabase
    .from("campanha_membros")
    .select("id")
    .eq("campanha_id", campaign.id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    redirect(`/dashboard/campanha/${campaign.id}`);
  }

  const { data: characters } = await supabase
    .from("personagens")
    .select("id, name, forca, velocidade, resistencia, sabedoria, carisma, role, vida_max, mente_max")
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 noise-overlay scanline-overlay">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-6 sm:p-8 w-full max-w-md backdrop-blur-sm animate-fade-slide-up">
        <div className="mb-6 text-center">
          <h1 className="text-lg uppercase tracking-[0.3em] text-zinc-100 mb-2">
            Convite
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Você foi convidado para
          </p>
          <p className="text-sm text-zinc-300 font-mono mt-1">
            {campaign.name}
          </p>
          {campaign.description && (
            <p className="text-[10px] text-zinc-600 font-mono mt-2">
              {campaign.description}
            </p>
          )}
        </div>

        <AcceptInviteForm
          campaignId={campaign.id}
          inviteId={invite.id}
          characters={(characters ?? []).map((c) => ({
            id: c.id,
            name: c.name,
          }))}
        />
      </div>
    </div>
  );
}
