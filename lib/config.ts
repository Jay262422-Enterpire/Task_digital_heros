/** Platform economics — PRD left prices and pool split unspecified. */

export const PLANS = {
  MONTHLY: {
    id: "MONTHLY" as const,
    label: "Monthly",
    amountPence: 1200, // £12
    cadence: "month",
  },
  YEARLY: {
    id: "YEARLY" as const,
    label: "Yearly",
    amountPence: 10800, // £108 — 25% off 12 × £12
    cadence: "year",
  },
};

export const PRIZE_POOL_RATE = 0.4;
export const MIN_CHARITY_PERCENT = 10;
export const MAX_CHARITY_PERCENT = 90;
export const MAX_SCORES = 5;
export const SCORE_MIN = 1;
export const SCORE_MAX = 45;
export const DRAW_PICKS = 5;
export const NUMBER_MAX = 45;

export const TIER_SHARES = {
  5: 0.4, // jackpot — rolls over if unclaimed
  4: 0.35,
  3: 0.25,
} as const;

export const AUTH_COOKIE = "dh_session";
export const SESSION_DAYS = 14;
