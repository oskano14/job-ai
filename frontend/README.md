# AI Career Boost

Interface React (Vite + TypeScript) avec Tailwind CSS : Dashboard, Sidebar, et 3 sections (Analyse CV, Offres d'emploi, Simulateur d'entretien) en mode clair/sombre.

## Démarrer

```bash
npm install
npm run dev
```

## Backend (FastAPI)

Un squelette FastAPI est disponible dans `backend/` (upload CV + endpoint d'analyse).

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
