// filepath: src/pages/App.tsx
import { Outlet, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const isLogin = loc.pathname === "/login"; // viktigt: react-router location

  useEffect(() => {
    // Init
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setReady(true);
    });

    // Lyssna på auth-förändringar
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setAuthed(Boolean(session));
        // Om man redan är på /login och blir inloggad -> till startsidan
        if (session && isLogin) {
          nav("/", { replace: true });
        }
      }
    );
    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  if (!ready) return <div className="p-4">Laddar…</div>;
  // Om inte inloggad och inte på /login -> navigera till /login
  if (!authed && !isLogin) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <nav className="flex gap-3 items-center">
        <Link to="/" className="font-semibold">Hem</Link>
        <Link to="/transactions">Utlägg</Link>
        <Link to="/shared">Sparkonto</Link>
        <div className="ml-auto" />
        <button
          className="text-sm underline"
          onClick={async () => { await supabase.auth.signOut(); nav("/login", { replace: true }); }}
        >
          Logga ut
        </button>
      </nav>
      <Outlet />
    </div>
  );
}
