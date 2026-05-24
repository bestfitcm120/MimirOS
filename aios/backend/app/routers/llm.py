"""
LLM router — direct completion endpoint through OpenRouter.
Lets the frontend call the LLM without writing separate agent tasks.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.llm_service import LLMService
from app.config import settings

router = APIRouter()
_svc: Optional[LLMService] = None

def _get_svc() -> LLMService:
    global _svc
    if _svc is None:
        _svc = LLMService()
    return _svc


class CompletionRequest(BaseModel):
    system: str = "You are a helpful AI assistant."
    user: str
    max_tokens: int = 800
    model: Optional[str] = None   # override LLM_MODEL for this request


class CompletionResponse(BaseModel):
    text: str
    model: str
    provider: str = "openrouter"


@router.post("/complete", response_model=CompletionResponse)
async def complete(req: CompletionRequest):
    if not settings.openrouter_api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY not configured in .env",
        )
    svc = _get_svc()
    text = await svc.complete(
        system=req.system,
        user=req.user,
        max_tokens=req.max_tokens,
        model=req.model,
    )
    return CompletionResponse(text=text, model=req.model or settings.llm_model)


@router.get("/status")
async def llm_status():
    return {
        "provider": "openrouter",
        "base_url": settings.openrouter_base_url,
        "model": settings.llm_model,
        "configured": bool(settings.openrouter_api_key),
    }


@router.get("/models")
async def list_models():
    """Proxy to OpenRouter's model list."""
    import httpx
    if not settings.openrouter_api_key:
        raise HTTPException(status_code=503, detail="OPENROUTER_API_KEY not set")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
            timeout=10,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="OpenRouter error")
    data = resp.json()
    # Return simplified list
    return {
        "models": [
            {
                "id": m["id"],
                "name": m.get("name", m["id"]),
                "context_length": m.get("context_length"),
                "pricing": m.get("pricing", {}),
            }
            for m in data.get("data", [])
        ]
    }
