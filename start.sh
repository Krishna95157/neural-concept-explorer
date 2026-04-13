#!/usr/bin/env bash
# Start both backend and frontend.
# Usage: bash start.sh

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Knowledge Graph · Embedding · Token Visualizer ==="
echo ""

# Kill any stale processes on these ports
echo "→ Cleaning up stale processes …"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# ── Backend ──────────────────────────────────────────────────────────────────
echo "→ Starting FastAPI backend on http://localhost:8000 …"
cd "$ROOT/backend"

if [ ! -d ".venv" ]; then
  echo "  Creating Python virtual environment …"
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

# Download spaCy model if missing
python -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null || \
  python -m spacy download en_core_web_sm -q

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "  Waiting for backend …"
for i in $(seq 1 15); do
  curl -s http://localhost:8000/health > /dev/null 2>&1 && break
  sleep 1
done
echo "  Backend ready."

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "→ Starting React frontend on http://localhost:5173 …"
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
  echo "  Installing npm dependencies …"
  npm install
fi

npm run dev -- --port 5173 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "✓ Both servers running."
echo ""
echo "  Frontend  : http://localhost:5173"
echo "  Backend   : http://localhost:8000"
echo "  API docs  : http://localhost:8000/docs"
echo ""
echo "  Tabs: Scatter · Heatmap · Neighbours · Compare · Tokens · Graph · Hybrid · Explain"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
