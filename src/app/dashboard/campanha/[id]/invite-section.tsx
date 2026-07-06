"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link as LinkIcon, Check, Copy } from "lucide-react";

interface Props {
  campaignId: string;
}

export function InviteSection({ campaignId }: Props) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateInvite() {
    setGenerating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    const { error } = await supabase.from("campanha_convites").insert({
      campanha_id: campaignId,
      token,
      created_by: user.id,
    });

    if (error) {
      alert("Erro ao gerar convite: " + error.message);
      setGenerating(false);
      return;
    }

    setInviteLink(`${window.location.origin}/convite/${token}`);
    setGenerating(false);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {!inviteLink ? (
        <button
          type="button"
          onClick={generateInvite}
          disabled={generating}
          className="flex items-center gap-2 border border-zinc-700 rounded-lg px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-zinc-400 hover:text-white transition-all duration-300 disabled:opacity-50"
        >
          <LinkIcon size={14} />
          {generating ? "Gerando..." : "Convidar"}
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2">
          <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
            {inviteLink}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Copiar link"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
