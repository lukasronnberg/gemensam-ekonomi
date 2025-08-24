import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { SharedSavingsRow, Member } from "../types";

export default function Shared() {
  const [rows, setRows] = useState<SharedSavingsRow[]>([]);
  const [saldo, setSaldo] = useState(0);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0,10),
    type: "deposit",
    member: "lukas" as Member,
    amount: "",
    note: ""
  });

  async function load() {
    const { data, error } = await supabase.from("shared_savings").select("*").order("date", { ascending: false }).limit(30);
    if (!error && data) {
      const ds = data as SharedSavingsRow[];
      setRows(ds);
      const deposits = ds.filter(d => d.type === "deposit").reduce((a,b)=>a+Number(b.amount),0);
      const payouts  = ds.filter(d => d.type === "payout").reduce((a,b)=>a+Number(b.amount),0);
      setSaldo(Math.round((deposits - payouts + Number.EPSILON)*100)/100);
    }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const insert = {
      owner_uid: (await supabase.auth.getUser()).data.user!.id,
      date: form.date,
      type: form.type as "deposit"|"payout",
      member: form.type === "payout" ? form.member : null,
      amount: Number(form.amount || 0),
      note: form.note || null,
    };
    const { error } = await supabase.from("shared_savings").insert(insert);
    if (!error) { setForm({ ...form, amount:"", note:"" }); load(); } else { alert(error.message); }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sparkonto (saldo: {saldo} kr)</h2>
      <form onSubmit={create} className="bg-white rounded-xl p-4 shadow space-y-3">
        <div><label className="block text-sm">Datum</label>
          <input type="date" className="w-full border rounded p-2" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
        </div>
        <div><label className="block text-sm">Typ</label>
          <select className="w-full border rounded p-2" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="deposit">Insättning</option>
            <option value="payout">Utbetalning</option>
          </select>
        </div>
        {form.type === "payout" && (
          <div><label className="block text-sm">Mottagare</label>
            <select className="w-full border rounded p-2" value={form.member} onChange={e=>setForm({...form, member:e.target.value as Member})}>
              <option value="lukas">Lukas</option>
              <option value="annie">Annie</option>
            </select>
          </div>
        )}
        <div><label className="block text-sm">Belopp (kr)</label>
          <input type="number" step="0.01" className="w-full border rounded p-2" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/>
        </div>
        <div><label className="block text-sm">Meddelande</label>
          <input className="w-full border rounded p-2" value={form.note} onChange={e=>setForm({...form, note:e.target.value})}/>
        </div>
        <button className="w-full bg-black text-white rounded-xl py-2 font-semibold">Spara</button>
      </form>

      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Historik</h3>
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.id} className="flex justify-between text-sm border-b pb-1">
              <div>{r.date} · {r.type === "deposit" ? "Insättning" : `Utbetalning → ${r.member === "lukas" ? "Lukas" : "Annie"}`}</div>
              <div className="font-medium">{r.amount} kr</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
