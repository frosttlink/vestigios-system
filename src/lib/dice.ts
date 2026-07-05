import type { DiceRollResult, Difficulty } from "./types";
import { DIFFICULTY_VALUES } from "./types";
import type { Action, Domain } from "./types";

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollD4(): number {
  return Math.floor(Math.random() * 4) + 1;
}

export function rollD8(): number {
  return Math.floor(Math.random() * 8) + 1;
}

export function rollMultiple(count: number, sides: number): number[] {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * sides) + 1,
  );
}

export function calculateLife(forca: number, velocidade: number, resistencia: number): number {
  return (forca + velocidade + resistencia) * 5;
}

export function calculateMind(sabedoria: number, resistencia: number, carisma: number): number {
  return (sabedoria + resistencia + carisma) * 5;
}

export function performTest(
  actionValue: number,
  difficulty: Difficulty,
): DiceRollResult {
  const natural = rollD10();
  const modifier = actionValue;
  const total = natural + modifier;
  const difficultyValue = DIFFICULTY_VALUES[difficulty];

  let success: DiceRollResult["success"];
  if (natural === 1) {
    success = "desastre";
  } else if (natural === 10) {
    success = "critico";
  } else if (total >= difficultyValue) {
    success = "sucesso";
  } else {
    success = "falha";
  }

  return {
    roll: natural,
    modifier,
    total,
    difficulty: difficultyValue,
    success,
    natural,
  };
}

export function rollDamage(formula: string): number {
  const match = formula.match(/^(\d+)d(\d+)(?:\+(\d+))?$/);
  if (!match) return 0;
  const count = Number.parseInt(match[1], 10);
  const sides = Number.parseInt(match[2], 10);
  const bonus = match[3] ? Number.parseInt(match[3], 10) : 0;
  const rolls = rollMultiple(count, sides);
  return rolls.reduce((sum, r) => sum + r, 0) + bonus;
}

export function testLabel(success: DiceRollResult["success"]): { text: string; color: string } {
  switch (success) {
    case "critico":
      return { text: "Sucesso Extremo!", color: "text-green-400" };
    case "sucesso":
      return { text: "Sucesso", color: "text-blue-400" };
    case "falha":
      return { text: "Falha", color: "text-yellow-400" };
    case "desastre":
      return { text: "Falha Extrema!", color: "text-red-500" };
  }
}
