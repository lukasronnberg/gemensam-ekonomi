// filepath: src/pages/App.tsx
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    // Init-session
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setReady(true);
    });

    // Lyssna på auth-förändringar
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setAuthed(Boolean(session));
        if (!session && loc.pathname !== "/login") nav("/login");
        if (session && loc.pathname === "/login") nav("/");
      }
    );

    return () => {
      // städa upp
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <div className="p-4">Laddar…</div>;
  if (!authed && location.pathname !== "/login") return <div className="p-4">Omdirigerar…</div>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <nav className="flex gap-3">
        <Link to="/" className="font-semibold">Hem</Link>
        <Link to="/transactions">Utlägg</Link>
        <Link to="/shared">Sparkonto</Link>
        {/* Logga ut */}
        <button
          className="ml-auto text-sm underline"
          onClick={async () => { await supabase.auth.signOut(); nav("/login"); }}
        >
          Logga ut
        </button>
      </nav>
      <Outlet />
    </div>
  );
}
