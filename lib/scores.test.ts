import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planScoreWrite, startOfDay } from "./scores";

const d = (iso: string) => startOfDay(new Date(`${iso}T00:00:00Z`));

describe("planScoreWrite", () => {
  it("rejects a second score on the same date", () => {
    assert.throws(
      () =>
        planScoreWrite(
          [{ id: "1", value: 32, playedOn: d("2026-09-01") }],
          { value: 28, playedOn: d("2026-09-01") }
        ),
      /one score is allowed per date/i
    );
  });

  it("drops the oldest when a sixth round is added", () => {
    const existing = [1, 2, 3, 4, 5].map((n) => ({
      id: String(n),
      value: 20 + n,
      playedOn: d(`2026-09-0${n}`),
    }));
    const result = planScoreWrite(existing, {
      value: 40,
      playedOn: d("2026-09-10"),
    });
    assert.deepEqual(result.dropIds, ["1"]);
    assert.equal(result.keep.length, 5);
    assert.equal(result.keep[0]?.value, 40);
  });

  it("allows editing in place without dropping", () => {
    const existing = [{ id: "1", value: 22, playedOn: d("2026-09-01") }];
    const result = planScoreWrite(existing, {
      id: "1",
      value: 30,
      playedOn: d("2026-09-01"),
    });
    assert.deepEqual(result.dropIds, []);
    assert.equal(result.keep[0]?.value, 30);
  });
});
