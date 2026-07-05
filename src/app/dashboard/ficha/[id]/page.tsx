import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CharacterSheetView } from "@/components/ficha/character-sheet-view";
import { DOMAINS, ROLES } from "@/lib/constants";
import { calculateLife, calculateMind } from "@/lib/dice";
import type { Action, Character } from "@/lib/types";
import { ACTIONS } from "@/lib/constants";

export default async function FichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: character } = await supabase
    .from("personagens")
    .select("*")
    .eq("id", id)
    .single();

  if (!character) {
    notFound();
  }

  return <CharacterSheetView character={character as unknown as Character} />;
}
