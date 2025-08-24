// filepath: webapp/gemensam-eko-web/src/lib/split.invariants.test.ts
import { test, expect, describe } from "vitest";
import { computeShares } from "./split";

describe("computeShares invariants", () => {
  test("summan av andelar = total", () => {
    const total = 1234.56;
    const a = computeShares(total, "equal");
    expect(a.lukas + a.annie).toBe(total);

    const b = computeShares(total, "percent", { payer: "lukas", percentForPayer: 0.7 });
    expect(b.lukas + b.annie).toBe(total);

    const c = computeShares(total, "fixed", { fixedWho: "annie", fixedAmount: 300 });
    expect(c.lukas + c.annie).toBe(total);
  });

  test("percent defaultar till 50/50 när percentForPayer = null", () => {
    const res = computeShares(200, "percent", { payer: "annie", percentForPayer: null });
    expect(res).toEqual({ lukas: 100, annie: 100 });
  });

  test("fixed utan belopp defaultar till 50/50", () => {
    const res = computeShares(500, "fixed", { payer: "lukas", fixedWho: "lukas", fixedAmount: null });
    expect(res).toEqual({ lukas: 250, annie: 250 });
  });
});
