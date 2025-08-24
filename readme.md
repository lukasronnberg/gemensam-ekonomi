# Gemensam Ekonomi (MVP)

&#x20; &#x20;

En mobilvänlig webapp för hushållets gemensamma finanser. Byggd med React + TypeScript + Supabase och hostad gratis på GitHub Pages.

- **Utlägg** med flexibel delning (lika / procent / fast belopp).
- **Sparkonto** (insättningar/utbetalningar) + **översikt** av balans.
- **Supabase** för autentisering och datalagring.
- **Mobilvänligt UI** med TailwindCSS.
- **PWA-stöd** (manifest + service worker) för att kunna installeras som app.

---

## Innehåll

- [Funktioner](#funktioner)
- [Teknikstack](#teknikstack)
- [Kom igång (lokalt)](#kom-igång-lokalt)
- [Projektstruktur](#projektstruktur)
- [Konfiguration](#konfiguration)
- [Utveckling: format, lint, tester](#utveckling-format-lint-tester)
- [CI (GitHub Actions)](#ci-github-actions)
- [Roadmap](#roadmap)
- [Versioner & licens](#versioner--licens)

---

## Funktioner

- **Utlägg**: datum, kategori, belopp, betalare. Delningsmetod styr dynamiskt vilka extra fält som visas.
- **Delningslogik**: netto per person = (betalat) − (sin andel). Summan över alla poster balanserar till 0.
- **Sparkonto**: insättningar/utbetalningar; översikt visar aktuellt saldo.
- **Hem**: ”Vem är skyldig vem?” + rekommenderad utbetalning (begränsad av sparkontosaldo).
- **Autentisering**: inloggning med Supabase Email+Password.

---

## Teknikstack

- **Frontend:** React 19, TypeScript 5.8, Vite 7
- **UI:** TailwindCSS 4
- **Routing:** React Router DOM 7
- **Backend:** Supabase (Postgres + Auth)
- **Testning:** Vitest + React Testing Library
- **CI:** GitHub Actions (typecheck, lint, test, build)

---

## Kom igång (lokalt)

```bash
# 1) Installera beroenden
npm install

# 2) Starta utvecklingsserver
npm run dev

# 3) Öppna i webbläsare
http://127.0.0.1:5173/gemensam-ekonomi/
```

Bygg för produktion:

```bash
npm run build
```

Förhandsgranska produktionen lokalt:

```bash
npm run preview
```

---

## Projektstruktur

```
gemensam-ekonomi/
├── src/           # React components & logic
│   ├── lib/       # supabase.ts, split.ts (+ tester)
│   ├── pages/     # App.tsx, Home.tsx, Transactions.tsx, Shared.tsx, Login.tsx
│   └── types.ts   # Delade TypeScript-typer
├── public/        # Statisk innehåll
├── docs/          # Byggoutput för GitHub Pages (index.html, 404.html, assets)
├── package.json   # npm-dependencies och scripts
├── vite.config.ts # Vite config (base:'/gemensam-ekonomi/', outDir:'docs')
└── index.html     # Entrypoint
```

---

## Konfiguration

Skapa en `.env`-fil i projektroten:

```env
VITE_SUPABASE_URL=din_supabase_url
VITE_SUPABASE_ANON_KEY=din_supabase_anon_key
```

---

## Utveckling: format, lint, tester

```bash
# Formattera kod
npm run format

# Lint (ESLint)
npm run lint

# Typkontroll (TypeScript)
npm run typecheck

# Tester (Vitest)
npm run test
```

Full pipeline (körs också i CI):

```bash
npm run ci:check
```

---

## CI (GitHub Actions)

Workflow `.github/workflows/web-ci.yml` körs på varje push/PR:

- Typecheck (tsc)
- ESLint
- Vitest
- Bygg med Vite

---

## Roadmap

-

---

## Versioner & licens

- Semantisk versionering via taggar: `v0.1.0`, `v0.2.0`, …
- Licens: **MIT** – se filen [`LICENSE`](./LICENSE).

