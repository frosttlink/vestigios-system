import type { Action, Domain, Role } from "./types";

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
