export type Domain = "forca" | "velocidade" | "resistencia" | "sabedoria" | "carisma";

export type Action =
  | "analisar"
  | "atacar"
  | "compreender"
  | "defender"
  | "disparar"
  | "esquivar"
  | "esconder"
  | "fugir"
  | "intimidar"
  | "jornada"
  | "manusear"
  | "mobilidade"
  | "observar"
  | "ouvir"
  | "procurar"
  | "convencer";

export type Role =
  | "policial"
  | "detetive"
  | "hacker"
  | "jornalista"
  | "medico"
  | "engenheiro"
  | "sentinela"
  | "bombeiro"
  | "cientista"
  | "sobrevivente"
  | "psicologo"
  | "esportista"
  | "lutador"
  | "explorador";

export type Condition =
  | "sangrando"
  | "atordoado"
  | "machucado"
  | "apavorado"
  | "camuflado"
  | "pesado"
  | "adrenalina"
  | "tenso";

export interface SupernaturalPower {
  name: string;
  type: "magia" | "ritual" | "alquimia";
  description: string;
  effect: string;
  cost?: { pi?: number; mente?: number; ingredients?: string };
}

export interface InventoryItem {
  name: string;
  size: "pequeno" | "medio" | "grande" | "pesado";
  quantity: number;
}

export interface Equipment {
  name: string;
  type: "arma" | "protecao" | "ferramenta" | "item";
  damage?: string;
  description?: string;
  equipped: boolean;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  description: string;
  backstory: string;
  fears: string;
  forca: number;
  velocidade: number;
  resistencia: number;
  sabedoria: number;
  carisma: number;
  actions: Record<Action, number>;
  role: Role | null;
  pi: number;
  pt: number;
  vida_max: number;
  mente_max: number;
  vida_atual: number;
  mente_atual: number;
  inventory: InventoryItem[];
  equipment: Equipment[];
  conditions: Condition[];
  traumas: string[];
  powers: SupernaturalPower[];
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  master_id: string;
  name: string;
  description: string;
  characters: string[];
  created_at: string;
}

export interface Enemy {
  id: string;
  campaign_id: string;
  name: string;
  vida: number;
  defesa: number;
  pa: number;
  tamanho: string;
  caracteristicas: string;
  ponto_fraco: string;
  ataques: EnemyAttack[];
}

export interface EnemyAttack {
  name: string;
  type: "simples" | "normal" | "fatal";
  damage: string;
  pa_cost: number;
  description: string;
}

export type Difficulty = "facil" | "medio" | "dificil" | "extremo";

export const DIFFICULTY_VALUES: Record<Difficulty, number> = {
  facil: 6,
  medio: 8,
  dificil: 10,
  extremo: 12,
};

export interface DiceRollResult {
  roll: number;
  modifier: number;
  total: number;
  difficulty: number;
  success: "critico" | "sucesso" | "falha" | "desastre";
  natural: number;
}
