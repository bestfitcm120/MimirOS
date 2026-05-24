#!/bin/bash
set -e
echo "=== AIOS Installation ==="
command -v docker >/dev/null || { echo "ERROR: Install Docker first"; exit 1; }
command -v node >/dev/null || { echo "ERROR: Install Node.js 20+"; exit 1; }
command -v python3 >/dev/null || { echo "ERROR: Install Python 3.11+"; exit 1; }

[ ! -f .env ] && cp .env.example .env && echo ">> Edit .env with your API keys before continuing"

docker compose up -d postgres redis minio
echo "Waiting for services..."
sleep 8

cd frontend && npm install && npm run build && cd ..
python3 -m venv venv
venv/bin/pip install --upgrade pip
venv/bin/pip install -r backend/requirements.txt

echo ""
echo "=== Done. Run: docker compose up ==="
echo "Frontend: http://localhost:5173 (dev) or http://localhost (prod)"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
