import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TransactionRow, SharedSavingsRow, Member } from "../types";
import { computeShares, netForMember, round2 } from "../lib/split";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [saldo, setSaldo] = useState(0);
  const [suggest, setSuggest] = useState<{ lukas: number; annie: number }>({
    lukas: 0,
    annie: 0,
  });
  const [latest, setLatest] = useState<TransactionRow[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [txRes, shRes] = await Promise.all([
      supabase.from("transactions").select("*").order("date", { ascending: false }).limit(50),
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

    const deposits = ss
      .filter((x) => x.type === "deposit")
      .reduce((a, b) => a + Number(b.amount), 0);
    const payouts = ss
      .filter((x) => x.type === "payout")
      .reduce((a, b) => a + Number(b.amount), 0);
    const sSaldo = round2(deposits - payouts);
    setSaldo(sSaldo);

    // Föreslagen utbetalning: positivt netto → belopp = min(netto, saldo), en mottagare i taget i ordning
    const sug = { lukas: 0, annie: 0 };
    let remaining = sSaldo;
    if (netL > 0) {
      const bel = Math.min(netL, remaining);
      sug.lukas = round2(bel);
      remaining -= bel;
    }
    if (netA > 0 && remaining > 0) {
      const bel = Math.min(netA, remaining);
      sug.annie = round2(bel);
      remaining -= bel;
    }
    setSuggest(sug);

    // Senaste 3 utlägg
    setLatest(txs.slice(0, 3));
  }

  useEffect(() => {
    load();
  }, []);

  function suggestedTarget(): { who: Member | null; amount: number } {
    if (suggest.lukas > 0) return { who: "lukas", amount: suggest.lukas };
    if (suggest.annie > 0) return { who: "annie", amount: suggest.annie };
    return { who: null, amount: 0 };
    }

  async function payOut() {
    const { who, amount } = suggestedTarget();
    if (!who || amount <= 0) return;

    const name = who === "lukas" ? "Lukas" : "Annie";
    const ok = window.confirm(`Betala ut ${amount} kr till ${name}?`);
    if (!ok) return;

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const owner_uid = userData.user?.id;
      if (!owner_uid) return alert("Inte inloggad.");

      const insert = {
        owner_uid,
        date: todayISO(),
        type: "payout" as const,
        member: who,
        amount,
        note: "Auto payout (Home)",
      };
      const { error } = await supabase.from("shared_savings").insert(insert);
      if (error) throw error;
      await load();
    } catch (e: any) {
      alert(e.message ?? "Kunde inte skapa utbetalning.");
    } finally {
      setBusy(false);
    }
  }

  const { who, amount } = suggestedTarget();
  const summary =
    who && amount > 0
      ? `Betala ut ${amount} kr till ${who === "lukas" ? "Lukas" : "Annie"}`
      : "Ingen utbetalning föreslås just nu.";

  const disablePay = !who || amount <= 0 || saldo <= 0 || busy;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Översikt</h2>

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-600">Sparkonto saldo</div>
        <div className="text-2xl font-semibold">{saldo} kr</div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Föreslagen utbetalning</h3>
        <div className="text-sm mb-2">{summary}</div>
        <button
          disabled={disablePay}
          onClick={payOut}
          className={`w-full rounded-xl py-2 font-semibold ${
            disablePay ? "bg-gray-300 text-gray-600" : "bg-black text-white"
          }`}
        >
          Betala ut
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Senaste utlägg</h3>
        <div className="space-y-2">
          {latest.length === 0 && (
            <div className="text-gray-500">Inga utlägg ännu.</div>
          )}
          {latest.map((t) => (
            <div key={t.id} className="flex justify-between text-sm border-b pb-1">
              <div>
                <div className="font-medium">
                  {t.category} – {t.amount} kr
                </div>
                <div className="text-gray-600">
                  {t.date} · {t.description ?? ""}
                </div>
              </div>
              <div className="text-right text-gray-600">
                <div>Betalare: {t.payer === "lukas" ? "Lukas" : "Annie"}</div>
                <div>{t.is_shared ? "Gemensam" : "Privat"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
