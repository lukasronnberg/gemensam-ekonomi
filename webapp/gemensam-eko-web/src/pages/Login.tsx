// filepath: src/pages/Login.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function useQueryParam(name: string) {
  return useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }, [name]);
}

export default function Login() {
  const [email, setEmail] = useState<string>(
    import.meta.env.VITE_LOGIN_EMAIL || localStorage.getItem("last_email") || ""
  );
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);

  // Engångs "provision-länk": ?rt=<refresh_token>
  const rt = useQueryParam("rt");

  // Om det finns en refresh_token i URL:en – logga in direkt utan input
  useEffect(() => {
    async function provisionWithRefreshToken(refreshToken: string) {
      try {
        setStatus("Loggar in med engångslänk…");
        // Byt ut rt mot session (ingen mejl/lösenord behövs)
        const { error } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });
        if (error) throw error;

        // Rensa rt i URL så den inte återanvänds av misstag
        const url = new URL(window.location.href);
        url.searchParams.delete("rt");
        window.history.replaceState({}, "", url.toString());

        setStatus("Inloggad ✔️");
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setStatus(`Fel: ${errorMessage}`);
      }
    }
    if (rt) {
      void provisionWithRefreshToken(rt);
    }
  }, [rt]);

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      setStatus("Loggar in…");
      localStorage.setItem("last_email", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus("Inloggad ✔️");
      // supabase-js sparar sessionen i localStorage & auto-förnyar tokens
      // App.tsx flyttar dig vidare från /login när session finns
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setStatus(`Fel: ${errorMessage}`);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-2">Logga in</h2>

      {rt && (
        <div className="text-sm text-gray-600 mb-2">
          Engångslänk hittades – försöker logga in automatiskt…
        </div>
      )}

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

      <details className="mt-4 text-sm text-gray-700">
        <summary className="cursor-pointer">Alternativ: provision-länk</summary>
        <p className="mt-2">
          För att logga in en ny enhet utan att skriva lösenord kan du skapa en
          <b> engångslänk</b> från en redan inloggad enhet (se “Skapa provision-länk” i Hem).
        </p>
      </details>
    </div>
  );
}
