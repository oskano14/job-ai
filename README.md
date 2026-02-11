# job-ai (ALEX)

MVP de coaching RH avec :
- `frontend/` : React + Vite + TypeScript + Tailwind
- `backend/` : FastAPI (audit CV + chat + jobs via SerpApi)

## Démarrer

### Backend

```bash
python -m venv backend/.venv
./backend/.venv/Scripts/Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Variables (ex: dans `backend/.env`) :
- `GROQ_API_KEY` (obligatoire)
- `SERPAPI_API_KEY` (obligatoire pour les offres)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le front utilise un proxy Vite `/api` vers `http://localhost:8000`.

