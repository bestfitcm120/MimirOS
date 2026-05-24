# AIOS — AI Operating System & Command Center

A Linux-native AI operating layer connecting your projects, files, tasks, engineering work, agents, workflows, and long-term memory in one command center.

---

## Quick Start

### Prerequisites

- **Linux** (Ubuntu 22.04+ recommended, Debian/Fedora also work)
- **Docker + Docker Compose** v2.x
- **Node.js** 20+
- **Python** 3.11+
- **Git**

### 1. Clone & Configure

```bash
git clone <your-repo> aios
cd aios
cp .env.example .env
# Edit .env — set your OPENAI_API_KEY (required for embeddings/LLM)
nano .env
```

### 2. Start Infrastructure

```bash
docker compose up -d postgres redis minio
# Wait ~10 seconds for postgres to be ready
```

### 3. Start Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### 5. (Optional) Start Celery Worker

```bash
cd backend
source venv/bin/activate
celery -A app.workflows.runner worker --loglevel=info
```

### 6. (Optional) Start File Watcher

```bash
# Edit .env: set WATCH_DIRECTORIES and AIOS_USER_ID
cd linux/watchers
python3 file_watcher.py
```

---

## Architecture

```
Frontend (React + Vite)     http://localhost:5173
Backend (FastAPI)            http://localhost:8000
API Docs                     http://localhost:8000/docs
PostgreSQL                   localhost:5432
Redis                        localhost:6379
MinIO (file storage)         localhost:9000 / console: localhost:9001
```

---

## Project Structure

```
aios/
├── frontend/           React + Vite + Tailwind + React Flow
├── backend/            FastAPI + SQLAlchemy + LangGraph
├── linux/              systemd units, file watcher, install script
├── docker-compose.yml  All infrastructure services
├── .env.example        Environment variable template
└── README.md
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `OPENAI_API_KEY` | For embeddings + LLM | Yes |
| `DATABASE_URL` | PostgreSQL async URL | Auto-set |
| `REDIS_URL` | Redis connection | Auto-set |
| `MINIO_ENDPOINT` | MinIO file storage | Auto-set |
| `WATCH_DIRECTORIES` | Comma-separated local dirs to watch | Optional |
| `AIOS_USER_ID` | Your user UUID for file watcher | Optional |

---

## Development Notes

- The frontend runs entirely on mock data in `src/data/mockData.ts` — no backend required for UI development
- Replace `DEMO_USER_ID` in `mockData.ts` with your real user ID after creating one via `POST /api/users/`
- The backend auto-creates all database tables on startup via `init_db()`
- pgvector extension must be available in PostgreSQL — the `pgvector/pgvector:pg16` Docker image includes it
- File embeddings require `OPENAI_API_KEY` — the system works without it but semantic search will be disabled

---

## Phase Roadmap

| Phase | Status | Description |
|---|---|---|
| 1 — UI Shell | ✅ Done | Full visual shell with all 7 views |
| 2 — Database | ✅ Done | PostgreSQL schema, all models, CRUD APIs |
| 3 — File Ingestion | ✅ Done | Upload, extract, chunk, embed |
| 4 — Agents | 🔧 In progress | LangGraph agents with tools + approvals |
| 5 — Workflows | 🔧 In progress | Celery workflows with state persistence |
| 6 — Integrations | ⏳ Planned | Email, Calendar, GitHub, Google Drive |
| 7 — Learning | ⏳ Planned | Preference memory, agent improvement |
| 8 — Desktop App | ⏳ Planned | Tauri packaging, systemd services |

---

## Linux System Services

```bash
# After running install.sh — enable auto-start
sudo systemctl enable aios-backend
sudo systemctl enable aios-worker
sudo systemctl enable aios-watcher

sudo systemctl start aios-backend
sudo systemctl start aios-worker
sudo systemctl start aios-watcher
```

---

## API Reference

Full interactive API docs at **http://localhost:8000/docs** (Swagger UI)

Key endpoints:
- `POST /api/files/upload` — Upload and auto-ingest a file
- `GET /api/graph?user_id=...` — Get full memory graph nodes + edges
- `GET /api/search?q=...&user_id=...` — Hybrid keyword search
- `GET /api/tasks?user_id=...&overdue=true` — Get overdue tasks
- `PATCH /api/approvals/{id}` — Approve or reject agent action

---

## License

MIT
