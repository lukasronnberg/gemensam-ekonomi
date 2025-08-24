// src/lib/split.ts

export type SplitMethod = "equal" | "percent" | "fixed";
export type Member = "lukas" | "annie";

export const round2 = (x: number) =>
  Math.round((x + Number.EPSILON) * 100) / 100;

/**
 * Beräkna andelar för Lukas och Annie.
 * - method = "equal" | "percent" | "fixed"
 * - opts.percentForPayer: andel (0..1) som tillfaller betalaren (vid "percent")
 * - opts.fixedWho: vem det fasta beloppet gäller (vid "fixed")
 * - opts.fixedAmount: belopp som tillfaller fixedWho (vid "fixed")
 * - opts.payer: "lukas" | "annie"
 */
export function computeShares(
  amount: number,
  method: SplitMethod,
  opts?: {
    payer?: Member;
    percentForPayer?: number | null;
    fixedWho?: Member | null;
    fixedAmount?: number | null;
  }
): { lukas: number; annie: number } {
  const a = Number(amount) || 0;
  const payer: Member = opts?.payer ?? "lukas";

  if (method === "equal") {
    const half = round2(a / 2);
    return { lukas: half, annie: round2(a - half) };
  }

  if (method === "percent") {
    // default 50/50 om värde saknas
    let p = opts?.percentForPayer ?? 0.5;
    // klamra för säkerhets skull
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    const payerShare = round2(a * p);
    const otherShare = round2(a - payerShare);
    return payer === "lukas"
      ? { lukas: payerShare, annie: otherShare }
      : { lukas: otherShare, annie: payerShare };
  }

  // fixed
  const who: Member = opts?.fixedWho ?? payer;         // default: betalaren
  const fixed = round2(opts?.fixedAmount ?? a / 2);     // default: halva
  const other = round2(a - fixed);
  return who === "lukas"
    ? { lukas: fixed, annie: other }
    : { lukas: other, annie: fixed };
}

export function netForMember(paid: number, share: number): number {
  return round2(Number(paid) - Number(share));
}
