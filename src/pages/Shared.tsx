import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { SharedSavingsRow, Member } from "../types";

export default function Shared() {
  const [rows, setRows] = useState<SharedSavingsRow[]>([]);
  const [saldo, setSaldo] = useState(0);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "deposit",
    member: "lukas" as Member, // visas alltid (insättare/mottagare)
    amount: "",
    note: "",
  });

  async function load() {
    const { data, error } = await supabase
      .from("shared_savings")
      .select("*")
      .order("date", { ascending: false })
      .limit(30);

    if (!error && data) {
      const ds = data as SharedSavingsRow[];
      setRows(ds);

      const deposits = ds
        .filter((d) => d.type === "deposit")
        .reduce((a, b) => a + Number(b.amount), 0);
      const payouts = ds
        .filter((d) => d.type === "payout")
        .reduce((a, b) => a + Number(b.amount), 0);
      setSaldo(Math.round((deposits - payouts + Number.EPSILON) * 100) / 100);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();

    const amountNum = Number(form.amount || 0);
    if (!form.date) return alert("Datum saknas.");
    if (!amountNum || amountNum <= 0) return alert("Belopp måste vara > 0.");

    const { data: userData } = await supabase.auth.getUser();
    const owner_uid = userData.user?.id;
    if (!owner_uid) return alert("Inte inloggad.");

    // Spara member både för deposit (insättare) och payout (mottagare)
    const insert = {
      owner_uid,
      date: form.date,
      type: form.type as "deposit" | "payout",
      member: form.member, // alltid satt
      amount: amountNum,
      note: form.note || null,
    };

    const { error } = await supabase.from("shared_savings").insert(insert);
    if (!error) {
      setForm({ ...form, amount: "", note: "" });
      load();
    } else {
      alert(error.message);
    }
  }

  const isPayout = form.type === "payout";
  const whoLabel = isPayout ? "Mottagare" : "Insättare";

  function nameFor(member: Member | null) {
    if (!member) return "(okänd)";
    return member === "lukas" ? "Lukas" : "Annie";
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sparkonto (saldo: {saldo} kr)</h2>

      <form onSubmit={create} className="bg-white rounded-xl p-4 shadow space-y-3">
        <div>
          <label className="block text-sm">Datum</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm">Typ</label>
          <select
            className="w-full border rounded p-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="deposit">Insättning</option>
            <option value="payout">Utbetalning</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">{whoLabel}</label>
          <select
            className="w-full border rounded p-2"
            value={form.member}
            onChange={(e) =>
              setForm({ ...form, member: e.target.value as Member })
            }
          >
            <option value="lukas">Lukas</option>
            <option value="annie">Annie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Belopp (kr)</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded p-2"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            inputMode="decimal"
          />
        </div>

        <div>
          <label className="block text-sm">Meddelande</label>
          <input
            className="w-full border rounded p-2"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="valfritt"
          />
        </div>

        <button className="w-full bg-black text-white rounded-xl py-2 font-semibold">
          Spara
        </button>
      </form>

      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Historik</h3>
        <div className="space-y-2">
          {rows.map((r) => {
            const who = nameFor(r.member);
            const left =
              r.type === "deposit"
                ? `${r.date} · Insättning — ${who}`
                : `${r.date} · Utbetalning → ${who}`;
            const right = `${r.amount} kr`;
            return (
              <div key={r.id} className="flex justify-between text-sm border-b pb-1">
                <div>
                  <div>{left}</div>
                  {r.note ? (
                    <div className="text-gray-600">“{r.note}”</div>
                  ) : null}
                </div>
                <div className="font-medium">{right}</div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="text-gray-500">Ingen historik ännu.</div>
          )}
        </div>
      </div>
    </div>
  );
}
