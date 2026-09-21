import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  algorithmicNumbers,
  matchCount,
  randomNumbers,
  runDraw,
  splitPrizePool,
  ticketFromScores,
} from "./draw-engine";

describe("ticketFromScores", () => {
  it("dedupes and sorts", () => {
    assert.deepEqual(ticketFromScores([36, 12, 36, 4]), [4, 12, 36]);
  });
});

describe("matchCount", () => {
  it("counts unique overlapping numbers", () => {
    assert.equal(matchCount([12, 24, 31, 38, 41], [12, 24, 31, 7, 8]), 3);
    assert.equal(matchCount([12, 12, 12, 12, 12], [12, 24, 31, 38, 41]), 1);
  });
});

describe("randomNumbers", () => {
  it("is deterministic for a seed and always five unique 1–45", () => {
    const a = randomNumbers("sep-2026");
    const b = randomNumbers("sep-2026");
    assert.deepEqual(a, b);
    assert.equal(a.length, 5);
    assert.equal(new Set(a).size, 5);
    assert.ok(a.every((n) => n >= 1 && n <= 45));
  });
});

describe("algorithmicNumbers", () => {
  it("can pick five unique numbers from weighted tickets", () => {
    const numbers = algorithmicNumbers(
      [
        { userId: "a", numbers: [1, 2, 3, 4, 5] },
        { userId: "b", numbers: [1, 2, 3, 4, 6] },
      ],
      "algo-seed"
    );
    assert.equal(numbers.length, 5);
    assert.equal(new Set(numbers).size, 5);
  });
});

describe("splitPrizePool", () => {
  it("splits a tier equally and rolls the jackpot when unclaimed", () => {
    const split = splitPrizePool(10000, [
      { userId: "a", matchCount: 3 },
      { userId: "b", matchCount: 3 },
      { userId: "c", matchCount: 4 },
    ]);
    assert.equal(split.jackpotPence, 4000);
    assert.equal(split.fourPence, 3500);
    assert.equal(split.threePence, 2500);
    assert.equal(split.jackpotRollover, true);
    const threeAwards = split.awards.filter((a) => a.matchCount === 3);
    assert.equal(threeAwards.reduce((s, a) => s + a.amountPence, 0), 2500);
    assert.equal(split.awards.find((a) => a.matchCount === 4)?.amountPence, 3500);
  });

  it("does not roll the jackpot when someone hits five", () => {
    const split = splitPrizePool(10000, [{ userId: "a", matchCount: 5 }]);
    assert.equal(split.jackpotRollover, false);
    assert.equal(split.awards[0]?.amountPence, 4000);
  });
});

describe("runDraw", () => {
  it("returns only 3+ matches", () => {
    const winning = randomNumbers("fixed");
    const result = runDraw({
      type: "RANDOM",
      seed: "fixed",
      tickets: [
        { userId: "hit", numbers: winning },
        { userId: "miss", numbers: [1, 2, 3, 4, 5].filter((n) => !winning.includes(n)).concat([99]).slice(0, 5) },
      ],
    });
    assert.equal(result.winningNumbers.length, 5);
    assert.ok(result.matches.some((m) => m.userId === "hit" && m.matchCount === 5));
    assert.ok(!result.matches.some((m) => m.userId === "miss"));
  });
});
