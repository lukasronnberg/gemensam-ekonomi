import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TransactionRow, SharedSavingsRow } from "../types";
import { computeShares, netForMember, round2 } from "../lib/split";

export default function Home() {
  const [net, setNet] = useState({ lukas: 0, annie: 0 });
  const [saldo, setSaldo] = useState(0);
  const [suggest, setSuggest] = useState({ lukas: 0, annie: 0 });

  async function load() {
    const [txRes, shRes] = await Promise.all([
      supabase.from("transactions").select("*"),
      supabase.from("shared_savings").select("*"),
    ]);
    const txs = (txRes.data ?? []) as TransactionRow[];
    const ss = (shRes.data ?? []) as SharedSavingsRow[];

    // Paid/Share per person
    const paid = { lukas: 0, annie: 0 };
    const share = { lukas: 0, annie: 0 };

    for (const t of txs) {
      paid[t.payer] += Number(t.amount);
      if (t.is_shared) {
        const s = computeShares(Number(t.amount), t.split_method, {
          payer: t.payer,
          percentForPayer: t.split_percent_for_payer,
          fixedWho: t.split_fixed_who ?? undefined,
          fixedAmount: t.split_fixed_amount ?? undefined,
        });
        share.lukas += s.lukas;
        share.annie += s.annie;
      }
    }

    const netL = netForMember(paid.lukas, share.lukas);
    const netA = netForMember(paid.annie, share.annie);
    setNet({ lukas: netL, annie: netA });

    const deposits = ss.filter(x => x.type === "deposit").reduce((a,b)=>a+Number(b.amount),0);
    const payouts  = ss.filter(x => x.type === "payout").reduce((a,b)=>a+Number(b.amount),0);
    const sSaldo = round2(deposits - payouts);
    setSaldo(sSaldo);

    // Föreslagen utbetalning: bara till den med positivt netto, begränsa till saldo
    const sug = { lukas: 0, annie: 0 };
    let remaining = sSaldo;
    if (netL > 0) { const bel = Math.min(netL, remaining); sug.lukas = round2(bel); remaining -= bel; }
    if (netA > 0) { const bel = Math.min(netA, remaining); sug.annie = round2(bel); remaining -= bel; }
    setSuggest(sug);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Översikt</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl shadow"><div className="text-sm text-gray-600">Lukas netto</div><div className="text-2xl font-semibold">{net.lukas} kr</div></div>
        <div className="bg-white p-4 rounded-xl shadow"><div className="text-sm text-gray-600">Annie netto</div><div className="text-2xl font-semibold">{net.annie} kr</div></div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-600">Sparkonto saldo</div>
        <div className="text-2xl font-semibold">{saldo} kr</div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Föreslagen utbetalning</h3>
        <div className="text-sm">Lukas: {suggest.lukas} kr</div>
        <div className="text-sm">Annie: {suggest.annie} kr</div>
        {/* (Senare) Knapp: Bokför föreslagen utbetalning */}
      </div>
      

    </div>
  );
  
}
