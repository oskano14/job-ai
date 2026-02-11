# Backend (FastAPI)

Squelette d'API pour supporter le front Vite.

## Installation

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Lancer en dev

```bash
cd ..
uvicorn backend.main:app --reload --port 8000
```

Depuis le dossier `backend/` (si tu es déjà dedans) :

```bash
uvicorn backend.main:app --reload --port 8000 --app-dir ..
```

Ou avec le script :

```bash
cd ..
python backend/run.py
```

Endpoints:
- `GET /health`
- `POST /analyze` (upload de fichier PDF)
- `POST /chat` (JSON: `message`, `history[]`, `cv_context`)
- `POST /start-scraping` (JSON: `keyword` → `jobs` via SerpApi Google Jobs)

## Variables d'environnement

- `GROQ_API_KEY` (obligatoire)
- `GROQ_MODEL` (optionnel, défaut: `llama-3.3-70b-versatile`)
- `GROQ_BASE_URL` (optionnel, défaut: `https://api.groq.com/openai/v1`)
- `SERPAPI_API_KEY` (obligatoire pour `/start-scraping`)
