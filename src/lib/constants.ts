import type { Action, Condition, Domain, Role } from "./types";

export const DOMAINS: { key: Domain; label: string; description: string }[] = [
  { key: "forca", label: "Força", description: "Poder físico" },
  { key: "velocidade", label: "Velocidade", description: "Reflexos e agilidade" },
  { key: "resistencia", label: "Resistência", description: "Saúde mental e física" },
  { key: "sabedoria", label: "Sabedoria", description: "Percepção e inteligência" },
  { key: "carisma", label: "Carisma", description: "Interações sociais" },
];

export const ACTIONS: { key: Action; label: string }[] = [
  { key: "analisar", label: "Analisar" },
  { key: "atacar", label: "Atacar" },
  { key: "compreender", label: "Compreender" },
  { key: "defender", label: "Defender" },
  { key: "disparar", label: "Disparar" },
  { key: "esquivar", label: "Esquivar" },
  { key: "esconder", label: "Esconder" },
  { key: "fugir", label: "Fugir" },
  { key: "intimidar", label: "Intimidar" },
  { key: "jornada", label: "Jornada" },
  { key: "manusear", label: "Manusear" },
  { key: "mobilidade", label: "Mobilidade" },
  { key: "observar", label: "Observar" },
  { key: "ouvir", label: "Ouvir" },
  { key: "procurar", label: "Procurar" },
  { key: "convencer", label: "Convencer" },
];

export const ROLES: { key: Role; label: string; ability: string; piCost?: number }[] = [
  { key: "policial", label: "Policial", ability: "+4 em Disparar por 3 PI", piCost: 3 },
  { key: "detetive", label: "Detetive", ability: "+4 em Compreender e Analisar por 3 PI", piCost: 3 },
  { key: "hacker", label: "Hacker", ability: "Encontrar pistas digitais por 2 PI", piCost: 2 },
  { key: "jornalista", label: "Jornalista", ability: "Contato útil ou acesso a informações públicas por 2 PI", piCost: 2 },
  { key: "medico", label: "Médico", ability: "Recuperar 3d4 de Vida por 3 PI", piCost: 3 },
  { key: "engenheiro", label: "Engenheiro", ability: "Criar ou consertar item improvisado por 3 PI", piCost: 3 },
  { key: "sentinela", label: "Sentinela", ability: "Possuir até 2 poderes sobrenaturais (3-6 PI, +2 PT em batalha)" },
  { key: "bombeiro", label: "Bombeiro", ability: "Tirar alguém de perigo sem teste por 3 PI", piCost: 3 },
  { key: "cientista", label: "Cientista", ability: "Analisar fenômeno/criatura por 3 PI", piCost: 3 },
  { key: "sobrevivente", label: "Sobrevivente", ability: "Encontrar água/comida/abrigo 1x/sessão por 3 PI", piCost: 3 },
  { key: "psicologo", label: "Psicólogo", ability: "Remover PT igual ao PI gasto de um aliado" },
  { key: "esportista", label: "Esportista", ability: "+5 em Mobilidade por 3 PI", piCost: 3 },
  { key: "lutador", label: "Lutador", ability: "Ataques desarmados causam 3d4 por 4 PI", piCost: 4 },
  { key: "explorador", label: "Explorador", ability: "Passar automaticamente em Jornada por 3 PI", piCost: 3 },
];

export const INVENTORY_SLOTS = {
  grande: 2,
  medio: 3,
  pequeno: 4,
} as const;

export const DOMAIN_MAX = 3;
export const DOMAIN_TOTAL = 5;
export const ACTION_MAX = 4;
export const ACTION_TOTAL = 15;
export const INITIAL_PI = 5;
export const INITIAL_PT = 0;

export const CONDITION_EFFECTS: Record<Condition, { label: string; effect: string }> = {
  sangrando: { label: "Sangrando", effect: "Perde 1 de Vida por rodada" },
  atordoado: { label: "Atordoado", effect: "Perde 1 ação simples" },
  machucado: { label: "Machucado", effect: "Falha automaticamente em testes de Mobilidade" },
  apavorado: { label: "Apavorado", effect: "Falha automaticamente em testes de Mente" },
  camuflado: { label: "Camuflado", effect: "Recebe +5 em testes de Esconder" },
  pesado: { label: "Pesado", effect: "-5 em Mobilidade e apenas 1 ação simples" },
  adrenalina: { label: "Adrenalina", effect: "+2 em qualquer teste durante a batalha" },
  tenso: { label: "Tenso", effect: "-3 em qualquer teste durante a batalha" },
};

export const DAMAGE_FORMULAS: Record<string, string> = {
  desarmado: "1d4",
  faca: "1d6",
  revolver: "1d8+2",
  improvisada_leve: "1d4+2",
  improvisada_pesada: "2d4",
};

export const PT_THRESHOLDS = [
  { value: 5, label: "Desconforto", description: "Paranoia e desconforto" },
  { value: 10, label: "Alucinações", description: "Começa a ter alucinações" },
];

export const COMBAT_BATTLE_ACTIONS = 1;
export const COMBAT_SIMPLE_ACTIONS = 2;
export const FATAL_ATTACK_BONUS_PI = 2;
export const CRITICAL_HIT_THRESHOLD_MIN = 9;
