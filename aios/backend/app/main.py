from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.config import settings
from app.database import init_db
from app.routers import (
    llm,
    projects, tasks, memories, documents, files,
    agents, workflows, graph, search, approvals,
    notifications, decisions, failures, events,
    users, people, companies
)

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting AIOS backend", env=settings.app_env)
    await init_db()
    yield
    log.info("AIOS backend shutting down")


app = FastAPI(
    title="AIOS — AI Operating System",
    description="Backend API for the AIOS command center",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(memories.router, prefix="/api/memories", tags=["Memories"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(graph.router, prefix="/api/graph", tags=["Graph"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["Approvals"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(decisions.router, prefix="/api/decisions", tags=["Decisions"])
app.include_router(failures.router, prefix="/api/failures", tags=["Failures"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(llm.router, prefix="/api/llm", tags=["LLM"])
app.include_router(people.router, prefix="/api/people", tags=["People"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "env": settings.app_env}
