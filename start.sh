#!/usr/bin/env bash
# Start both backend and frontend concurrently.
# Usage: bash start.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Embedding Space Explorer ==="
echo ""

# ── Backend ──────────────────────────────────────────────────────────────────
echo "→ Starting FastAPI backend on http://localhost:8000 …"
cd "$ROOT/backend"

if [ ! -d ".venv" ]; then
  echo "  Creating Python virtual environment …"
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "→ Starting React frontend on http://localhost:5173 …"
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
  echo "  Installing npm dependencies …"
  npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "✓ Both servers running."
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000"
echo "  API docs : http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
