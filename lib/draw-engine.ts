import { DRAW_PICKS, NUMBER_MAX, TIER_SHARES } from "./config";

export type DrawType = "RANDOM" | "ALGORITHMIC";

export type Ticket = {
  userId: string;
  numbers: number[];
};

export type DrawResult = {
  winningNumbers: number[];
  matches: Array<{
    userId: string;
    matchCount: number;
    numbers: number[];
  }>;
};

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

/** Ticket numbers are the player's latest Stableford scores (1–45). */
export function ticketFromScores(values: number[]): number[] {
  return uniqueSorted(values.filter((n) => n >= 1 && n <= NUMBER_MAX));
}

export function matchCount(ticket: number[], winning: number[]): number {
  const win = new Set(winning);
  return ticketFromScores(ticket).filter((n) => win.has(n)).length;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Standard lottery: five unique numbers from 1–45. */
export function randomNumbers(seed: string): number[] {
  const rng = mulberry32(seedFromString(seed));
  const pool = Array.from({ length: NUMBER_MAX }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return uniqueSorted(pool.slice(0, DRAW_PICKS));
}

/**
 * Algorithmic draw: numbers that appear more often in current tickets
 * are more likely to be drawn. Smoothing (+1) keeps rare scores in play.
 */
export function algorithmicNumbers(tickets: Ticket[], seed: string): number[] {
  const rng = mulberry32(seedFromString(seed));
  const freq = Array.from({ length: NUMBER_MAX + 1 }, () => 1);
  for (const ticket of tickets) {
    for (const n of ticketFromScores(ticket.numbers)) {
      freq[n] += 1;
    }
  }

  const picked: number[] = [];
  const available = Array.from({ length: NUMBER_MAX }, (_, i) => i + 1);

  while (picked.length < DRAW_PICKS && available.length > 0) {
    const total = available.reduce((sum, n) => sum + freq[n], 0);
    let roll = rng() * total;
    let chosenIndex = available.length - 1;
    for (let i = 0; i < available.length; i += 1) {
      roll -= freq[available[i]];
      if (roll <= 0) {
        chosenIndex = i;
        break;
      }
    }
    picked.push(available[chosenIndex]);
    available.splice(chosenIndex, 1);
  }

  return uniqueSorted(picked);
}

export function runDraw(params: {
  type: DrawType;
  tickets: Ticket[];
  seed: string;
}): DrawResult {
  const winningNumbers =
    params.type === "ALGORITHMIC"
      ? algorithmicNumbers(params.tickets, params.seed)
      : randomNumbers(params.seed);

  const matches = params.tickets
    .map((ticket) => ({
      userId: ticket.userId,
      numbers: ticketFromScores(ticket.numbers),
      matchCount: matchCount(ticket.numbers, winningNumbers),
    }))
    .filter((row) => row.matchCount >= 3)
    .sort((a, b) => b.matchCount - a.matchCount || a.userId.localeCompare(b.userId));

  return { winningNumbers, matches };
}

export type PrizeSplit = {
  totalPence: number;
  jackpotPence: number;
  fourPence: number;
  threePence: number;
  jackpotRollover: boolean;
  awards: Array<{ userId: string; matchCount: number; amountPence: number }>;
};

/**
 * Pool split is fixed by the PRD: 40 / 35 / 25.
 * Multiple winners in a tier split that tier equally.
 * Only the 5-number jackpot rolls forward when unclaimed.
 */
export function splitPrizePool(
  totalPence: number,
  matches: Array<{ userId: string; matchCount: number }>
): PrizeSplit {
  const jackpotPence = Math.round(totalPence * TIER_SHARES[5]);
  const fourPence = Math.round(totalPence * TIER_SHARES[4]);
  const threePence = totalPence - jackpotPence - fourPence;

  const byTier = {
    5: matches.filter((m) => m.matchCount === 5),
    4: matches.filter((m) => m.matchCount === 4),
    3: matches.filter((m) => m.matchCount === 3),
  };

  const awards: PrizeSplit["awards"] = [];

  function award(tier: 3 | 4 | 5, pot: number) {
    const winners = byTier[tier];
    if (winners.length === 0) return;
    const base = Math.floor(pot / winners.length);
    let remainder = pot - base * winners.length;
    for (const winner of winners) {
      const extra = remainder > 0 ? 1 : 0;
      remainder -= extra;
      awards.push({
        userId: winner.userId,
        matchCount: tier,
        amountPence: base + extra,
      });
    }
  }

  award(5, jackpotPence);
  award(4, fourPence);
  award(3, threePence);

  return {
    totalPence,
    jackpotPence,
    fourPence,
    threePence,
    jackpotRollover: byTier[5].length === 0,
    awards,
  };
}
