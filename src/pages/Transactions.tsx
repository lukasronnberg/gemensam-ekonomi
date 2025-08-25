import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TransactionRow, Member, SplitMethod } from "../types";

const CATEGORIES = [
  "Mat",
  "Hyra",
  "Transport",
  "Hushåll",
  "Nöje",
  "Resor",
  "Hälsa",
  "Gåva",
  "Annat …",
] as const;

export default function Transactions() {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    categoryPreset: "" as "" | (typeof CATEGORIES)[number],
    categoryCustom: "",
    description: "",
    amount: "",
    payer: "lukas" as Member,
    is_shared: true,
    split_method: "equal" as SplitMethod,
    percent: "",
    fixedWho: "lukas" as Member,
    fixedAmount: "",
  });

  function currentCategory(): string {
    if (form.categoryPreset && form.categoryPreset !== "Annat …") {
      return form.categoryPreset;
    }
    return form.categoryCustom.trim() || "";
  }

  async function load() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(20);
    if (!error && data) setRows(data as TransactionRow[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();

    const amount = Number(form.amount || 0);
    if (!amount || amount <= 0) return alert("Belopp måste vara > 0.");

    const category = currentCategory();
    if (!category) return alert("Välj en kategori eller skriv en egen.");

    const { data: userData } = await supabase.auth.getUser();
    const owner_uid = userData.user?.id;
    if (!owner_uid) return alert("Inte inloggad.");

    const insert = {
      owner_uid,
      date: form.date,
      category,
      description: form.description || null,
      amount,
      payer: form.payer,
      is_shared: form.is_shared,
      split_method: form.split_method,
      split_percent_for_payer:
        form.split_method === "percent"
          ? form.percent
            ? Number(form.percent)
            : null
          : null,
      split_fixed_who:
        form.split_method === "fixed" ? form.fixedWho : null,
      split_fixed_amount:
        form.split_method === "fixed"
          ? form.fixedAmount
            ? Number(form.fixedAmount)
            : null
          : null,
    };

    const { error } = await supabase.from("transactions").insert(insert);
    if (!error) {
      setForm({
        ...form,
        categoryPreset: "",
        categoryCustom: "",
        description: "",
        amount: "",
      });
      load();
    } else {
      alert(error.message);
    }
  }

  const showCustom = form.categoryPreset === "Annat …";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Utlägg</h2>

      <form onSubmit={create} className="bg-white rounded-xl p-4 shadow space-y-3">
        <div>
          <label className="block text-sm">Datum</label>
          <input
            name="date"
            type="date"
            required
            className="w-full border rounded p-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm">Kategori</label>
          <select
            className="w-full border rounded p-2"
            value={form.categoryPreset}
            onChange={(e) =>
              setForm({
                ...form,
                categoryPreset: e.target.value as any,
                // rensa custom om man byter bort från “Annat …”
                ...(e.target.value !== "Annat …" ? { categoryCustom: "" } : {}),
              })
            }
          >
            <option value="">— välj kategori —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {showCustom && (
            <div className="mt-2">
              <input
                className="w-full border rounded p-2"
                placeholder="Skriv egen kategori…"
                value={form.categoryCustom}
                onChange={(e) =>
                  setForm({ ...form, categoryCustom: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm">Beskrivning</label>
          <input
            className="w-full border rounded p-2"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm">Belopp (kr)</label>
          <input
            type="number"
            step="0.01"
            required
            className="w-full border rounded p-2"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            inputMode="decimal"
          />
        </div>

        <div>
          <label className="block text-sm">Betalare</label>
          <select
            className="w-full border rounded p-2"
            value={form.payer}
            onChange={(e) =>
              setForm({ ...form, payer: e.target.value as Member })
            }
          >
            <option value="lukas">Lukas</option>
            <option value="annie">Annie</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="chk_shared"
            type="checkbox"
            checked={form.is_shared}
            onChange={(e) =>
              setForm({ ...form, is_shared: e.target.checked })
            }
          />
          <label htmlFor="chk_shared">Gemensam?</label>
        </div>

        <div>
          <label className="block text-sm">Delningsmetod</label>
          <select
            className="w-full border rounded p-2"
            value={form.split_method}
            onChange={(e) =>
              setForm({
                ...form,
                split_method: e.target.value as SplitMethod,
              })
            }
          >
            <option value="equal">Lika (50/50)</option>
            <option value="percent">Procent (för betalaren)</option>
            <option value="fixed">Fast belopp</option>
          </select>
        </div>

        {form.split_method === "percent" && (
          <div>
            <label className="block text-sm">
              Procent {form.payer === "lukas" ? "Lukas" : "Annie"} (0–1)
            </label>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              className="w-full border rounded p-2"
              value={form.percent}
              onChange={(e) =>
                setForm({ ...form, percent: e.target.value })
              }
            />
          </div>
        )}

        {form.split_method === "fixed" && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm">Vem gäller beloppet?</label>
              <select
                className="w-full border rounded p-2"
                value={form.fixedWho}
                onChange={(e) =>
                  setForm({ ...form, fixedWho: e.target.value as Member })
                }
              >
                <option value="lukas">Lukas</option>
                <option value="annie">Annie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Fast belopp (kr)</label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                className="w-full border rounded p-2"
                value={form.fixedAmount}
                onChange={(e) =>
                  setForm({ ...form, fixedAmount: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <button className="w-full bg-black text-white rounded-xl py-2 font-semibold">
          Spara
        </button>
      </form>

      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="font-semibold mb-2">Senaste utlägg</h3>
        <div className="space-y-2">
          {rows.length === 0 && (
            <div className="text-gray-500">Inga utlägg ännu.</div>
          )}
          {rows.map((t) => (
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
