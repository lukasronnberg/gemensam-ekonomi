# Gemensam Ekonomi (MVP)

[![CI](https://github.com/lukasronnberg/gemensam-ekonomi/actions/workflows/ci.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/gemensam-ekonomi/actions/workflows/ci.yml)


En mobilvänlig FastAPI‑app för hushållets gemensamma finanser:

- **Utlägg** med flexibel delning (lika / procent / fast belopp) och mobilanpassade fält.
- **Sparkonto** (insättningar/utbetalningar) + **översikt** av ”vem är skyldig vem”.
- **PWA‑känsla** (manifest + service worker), **SQLite** lokalt, tydlig kodstruktur.

---

## Innehåll

- [Funktioner](#funktioner)
- [Teknikstack](#teknikstack)
- [Kom igång (lokalt)](#kom-igång-lokalt)
- [Projektstruktur](#projektstruktur)
- [Konfiguration](#konfiguration)
- [Användning](#användning)
- [Utveckling: format, lint, tester](#utveckling-format-lint-tester)
- [CI (GitHub Actions)](#ci-github-actions)
- [Felsökning](#felsökning)
- [Roadmap](#roadmap)
- [Versioner & licens](#versioner--licens)

---

## Funktioner

- **Utlägg**: datum, kategori, belopp, betalare. Delningsmetod styr dynamiskt vilka extra fält som visas.
- **Delningslogik**: netto per person = (betalat) − (sin andel). Summan över alla poster balanserar till 0.
- **Sparkonto**: insättningar/utbetalningar; översikt visar aktuellt saldo.
- **Hem**: ”Vem är skyldig vem?” + rekommenderad utbetalning (begränsad av sparkontosaldo).
- **Mobilvänligt UI** med Tailwind; kan ”läggas till på hemskärmen”.

---

## Teknikstack

- **Backend:** Python 3.11+/FastAPI, SQLModel (SQLite)
- **Templating:** Jinja2
- **UI:** Tailwind (CDN), vanilla JS
- **PWA:** `manifest.json`, enkel `service-worker.js`
- **CI:** GitHub Actions (ruff, black‑check, pytest)

---

## Kom igång (lokalt)

```bash
# 1) Skapa och aktivera venv
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
# .venv\Scripts\Activate

# 2) Installera beroenden
pip install -r requirements.txt

# 3) Starta utvecklingsserver (hot reload)
uvicorn backend.app:app --reload

# 4) Öppna i webbläsare
# http://127.0.0.1:8000
```

> För en helt ren start kan du radera `data.db`. Vid uppstart seedas då ”Lukas” och ”Annie”.

---

## Projektstruktur

```
gemensam-ekonomi/
├─ backend/
│  ├─ app.py            # FastAPI-app + routes
│  ├─ db.py             # Engine + init
│  ├─ models.py         # SQLModel-tabeller + Enums
│  ├─ services/
│  │  ├─ splits.py      # Delningslogik (andel/netto)
│  │  └─ __init__.py
│  ├─ tests/
│  │  ├─ test_splits.py # Pytest-unittester
│  │  └─ __init__.py
│  └─ __init__.py
├─ templates/           # Jinja-HTML (mobil först)
│  ├─ base.html
│  ├─ home.html
│  ├─ transactions.html
│  └─ shared.html
├─ static/
│  ├─ manifest.json
│  └─ service-worker.js
├─ .github/workflows/ci.yml
├─ requirements.txt
├─ requirements.lock.txt  # genererad via "pip freeze" (valfri)
├─ pyproject.toml         # black/ruff-konfig
├─ .gitignore
└─ README.md
```

---

## Konfiguration

Appen fungerar ”out of the box” med SQLite. För framtida deploy kan miljövariabler användas:

**.env.example**

```env
# Lokal standard med SQLite-fil
DATABASE_URL=sqlite:///./data.db

# Produktion (exempel, byt vid deploy)
# DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname
```

> Just nu läses inte `.env` automatiskt – sätt variabler i runtime eller utöka `db.py` med `python-dotenv` vid behov.

---

## Användning

1. **Sparkonto**  \
   Gå till `/shared` → lägg *Insättningar* (t.ex. 3000 + 3000). Saldot visas överst.

2. **Utlägg**  \
   Gå till `/transactions` → fyll i formuläret.

   - Delningsmetod:
     - **Lika** – extra fält döljs.
     - **Procent** – fält gäller *betalaren* (t.ex. ”Procent Annie”).
     - **Fast belopp** – välj om beloppet gäller Lukas eller Annie.

3. **Hem**  \
   Gå till `/` → se netto per person och rekommenderad utbetalning (begränsad av sparkontosaldo).

---

## Utveckling: format, lint, tester

```bash
# Formattera (Black)
black .

# Lint (Ruff)
ruff check .
# (autofixa enkla fel)
ruff check . --fix

# Tester (Pytest)
pytest -q
```

**Konfig:** se `pyproject.toml` (t.ex. `line-length = 100`).

---

## CI (GitHub Actions)

Workflow finns i `.github/workflows/ci.yml` och körs på push/PR:

- Installerar beroenden
- Kör Ruff, Black‑check, Pytest
- Bygger mot Python 3.11 och 3.12

---

## Felsökning

- **”ModuleNotFoundError: No module named 'backend'” vid pytest**  \
  Lägg `__init__.py` i `backend/`, `backend/services/`, `backend/tests/`. Kör pytest från projektroten.

- **422 Unprocessable Entity vid formulär**  \
  Tomma fält (t.ex. procent/fasta) skickas som tom sträng. Backend normaliserar dessa till `None`. Se `create_tx`.

- **”SQLite Date type only accepts Python date objects”**  \
  Servern kräver `datetime.date` – vi parserar i endpoints (`fromisoformat`). Se `shared_add`/`create_tx`.

- **Byta namn (”Sambo” → ”Annie”)**  \
  Antingen nollställ `data.db`, eller kör en enkel update via `sqlmodel`.

---

## Roadmap

-

---

## Versioner & licens

- Semantisk versionering via taggar: `v0.1.0`, `v0.2.0`, …
- Licens: **MIT** – se filen [`LICENSE`](./LICENSE).

