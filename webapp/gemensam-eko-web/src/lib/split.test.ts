// filepath: src/lib/split.test.ts
import { test, expect } from "vitest";
import { computeShares, netForMember } from "./split";

test("equal split", () => {
  expect(computeShares(600, "equal")).toEqual({ lukas: 300, annie: 300 });
});
// ...resten oförändrat...

test("equal split", () => {
  expect(computeShares(600, "equal")).toEqual({ lukas: 300, annie: 300 });
});
test("percent default 50/50, payer Lukas", () => {
  expect(computeShares(200, "percent", { payer: "lukas", percentForPayer: null }))
    .toEqual({ lukas: 100, annie: 100 });
});
test("percent custom 70% to payer Annie", () => {
  expect(computeShares(600, "percent", { payer: "annie", percentForPayer: 0.7 }))
    .toEqual({ lukas: 180, annie: 420 });
});
test("fixed default half to payer Lukas", () => {
  expect(computeShares(500, "fixed", { payer: "lukas", fixedAmount: null, fixedWho: null }))
    .toEqual({ lukas: 250, annie: 250 });
});
test("fixed given amount for Lukas", () => {
  expect(computeShares(1000, "fixed", { fixedWho: "lukas", fixedAmount: 250 }))
    .toEqual({ lukas: 250, annie: 750 });
});
test("net", () => {
  expect(netForMember(600, 300)).toBe(300);
  expect(netForMember(0, 300)).toBe(-300);
});
