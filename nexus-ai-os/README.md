# Nexus AI OS — AI Command Center

A local-first AI operating environment for daily tasks, engineering projects, files, agents, workflows, and long-term memory.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Linux (Ubuntu/Debian recommended) or WSL2

### 1. Clone & Start
```bash
cd nexus-ai-os
docker-compose up --build
```

This starts:
- PostgreSQL 16 + pgvector on port 5432
- Redis on port 6379
- FastAPI backend on port 8000
- React frontend on port 3000

### 2. Access
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Database**: `postgresql://nexus:nexus@localhost:5432/nexus`

### 3. Default Data
The system seeds with sample data:
- 1 user
- 4 projects (Engineering, Job Search, Course, Personal)
- 8 tasks (with overdue and blocked items)
- 5 memories (decisions, failures, preferences)
- 8 relationships (auto-linked graph edges)
- 5 events (activity log)
- 3 agents (Memory, Daily, Engineering)
- 1 pending approval

## Architecture

```
Linux Base
    ↓
PostgreSQL + pgvector (memory & vectors)
    ↓
FastAPI Backend (agents, workflows, ingestion)
    ↓
React + Vite Frontend (command center UI)
    ↓
User
```

## Project Structure

```
nexus-ai-os/
├── docker-compose.yml
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── database.py          # SQLAlchemy + asyncpg
│   │   ├── models.py            # Complete DB schema
│   │   ├── schemas.py           # Pydantic models
│   │   ├── routers/             # API endpoints
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   ├── files.py
│   │   │   ├── memories.py
│   │   │   ├── graph.py
│   │   │   └── search.py
│   │   └── services/            # Business logic
│   │       ├── ingestion.py
│   │       └── search.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main shell layout
│   │   ├── components/
│   │   │   ├── layout/          # TopBar, LeftPanel, Center, Inspector, Bottom
│   │   │   ├── graph/           # React Flow memory graph
│   │   │   ├── modes/           # Daily, Engineering, Agent views
│   │   │   └── command/         # Universal command bar
│   │   ├── stores/              # Zustand state management
│   │   └── hooks/               # API hooks
│   ├── package.json
│   └── Dockerfile
└── scripts/
    └── seed_data.sql            # Sample data
```

## Features (MVP v1)

### ✅ Implemented
- [x] Dark command-center UI with panel layout
- [x] Universal command bar (`/` hotkey)
- [x] Interactive memory graph (React Flow)
- [x] Daily dashboard with priorities, overdue, projects
- [x] Engineering project cockpit with 8 tabs
- [x] Agent console with status and logs
- [x] Right inspector panel (contextual details)
- [x] File upload endpoint
- [x] Full PostgreSQL schema with pgvector
- [x] REST API for all entities
- [x] Auto-generated graph relationships
- [x] Search across projects, tasks, files, memories

### 🚧 Coming Next
- [ ] Semantic search with embeddings
- [ ] File chunking & ingestion pipeline
- [ ] LangGraph agents with tool use
- [ ] Approval workflow gates
- [ ] Temporal durable workflows
- [ ] Linux file watcher integration
- [ ] Tauri desktop packaging
- [ ] Email/calendar integrations

## Development

### Backend Only
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Design Principles

1. **Execution-first, not interface-first** — Every UI element connects to real data
2. **Memory is the heart** — Structured, searchable, connected
3. **Agents are controlled** — Approval gates, tool logs, permission scopes
4. **Graph is functional** — Every node and edge represents real data
5. **Linux foundation** — Local files, background services, shell integration

## License

MIT — Build your own AI OS.
