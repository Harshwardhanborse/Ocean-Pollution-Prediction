# Ocean Pollution Prediction Website

A portfolio-ready educational prototype built with React + Vite and Python FastAPI. It accepts pH, turbidity, dissolved oxygen, and water temperature, then returns a demo pollution category from a Random Forest model trained on synthetic data. Predictions are saved in a local SQLite database and visualized in the frontend.

## Project structure
- `frontend/` — React + Vite UI and Recharts visualizations
- `backend/` — FastAPI API, scikit-learn model, SQLite prediction history

## Requirements
- Node.js (LTS recommended)
- Python 3.10 or newer

## Run locally (Windows PowerShell)

### 1. Backend
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```
API: http://127.0.0.1:8000
Interactive API docs: http://127.0.0.1:8000/docs

### 2. Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually http://localhost:5173.

## Configuration
For local development the frontend defaults to `http://127.0.0.1:8000`. To use another API URL, create `frontend/.env` from `frontend/.env.example` and set:
`VITE_API_URL=https://your-backend.example.com`

Restart/redeploy the frontend after changing Vite environment variables.

## Important limitations
The model is trained on synthetic, generated example data because this starter project does not include verified ocean sampling records. The output is an educational demonstration, not a scientifically validated environmental assessment. Do not use it for real-world decisions without validated data, documented thresholds, model evaluation, and domain-expert review.

Prediction history is stored in `backend/ocean_history.db` locally. This database file is created when the API runs.
