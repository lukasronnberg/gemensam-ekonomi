// filepath: src/pages/Login.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState<string>(
    import.meta.env.VITE_LOGIN_EMAIL || localStorage.getItem("last_email") || ""
  );
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      setStatus("Loggar in…");
      localStorage.setItem("last_email", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus("Inloggad ✔️"); // App.tsx flyttar dig vidare när session finns
    } catch (e: any) {
      setStatus(`Fel: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-2">Logga in</h2>
      <form onSubmit={signInPassword} className="space-y-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="namn@example.com"
          className="w-full border rounded p-2"
          type="email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Lösenord"
          className="w-full border rounded p-2"
          type="password"
          required
        />
        <button className="w-full bg-black text-white rounded p-2 font-semibold">
          Logga in
        </button>
      </form>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}
