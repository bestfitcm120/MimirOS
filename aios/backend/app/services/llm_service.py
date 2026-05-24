"""
LLM Service — uses OpenRouter as the backend.
OpenRouter is OpenAI-API-compatible, so we point the openai client
at https://openrouter.ai/api/v1 with the OpenRouter key.

Any model available on https://openrouter.ai/models can be used —
just set LLM_MODEL in .env.
"""
from typing import Optional
import structlog
from app.config import settings

log = structlog.get_logger()


def _make_client():
    """Build an openai AsyncClient pointed at OpenRouter."""
    if not settings.openrouter_api_key:
        return None
    try:
        from openai import AsyncOpenAI
        return AsyncOpenAI(
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url,
            default_headers={
                # Required by OpenRouter to identify your app
                "HTTP-Referer": settings.app_site_url,
                "X-Title": settings.app_site_name,
            },
        )
    except ImportError:
        log.error("openai package not installed — run: pip install openai")
        return None


class LLMService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            self._client = _make_client()
        return self._client

    async def complete(
        self,
        system: str,
        user: str,
        max_tokens: int = 1000,
        model: Optional[str] = None,
    ) -> str:
        client = self._get_client()
        if not client:
            return "[LLM unavailable — set OPENROUTER_API_KEY in .env]"

        chosen_model = model or settings.llm_model
        try:
            response = await client.chat.completions.create(
                model=chosen_model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": user},
                ],
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            log.error("OpenRouter completion failed", model=chosen_model, error=str(e))
            return f"[LLM error: {e}]"

    async def summarize(self, text: str, context: str = "") -> str:
        system = "You are a concise technical summarizer. Return a 2-3 sentence summary."
        user = f"{context}\n\nText to summarize:\n{text[:4000]}"
        return await self.complete(system, user, max_tokens=200)

    async def classify_event(self, text: str) -> str:
        system = (
            "Classify this input into exactly one category: "
            "task, file, project_update, decision, failure, follow_up, note, calendar_event. "
            "Return ONLY the category word, nothing else."
        )
        result = await self.complete(system, text, max_tokens=10)
        valid = {
            "task", "file", "project_update", "decision",
            "failure", "follow_up", "note", "calendar_event",
        }
        cleaned = result.strip().lower()
        return cleaned if cleaned in valid else "note"

    async def draft_email(self, context: str, tone: str = "professional") -> str:
        system = (
            f"You are an email drafting assistant. Write a {tone} email. "
            "Be concise. Return only the email body, no subject line."
        )
        return await self.complete(system, context, max_tokens=400)

    async def generate_daily_briefing(self, tasks: str, events: str) -> str:
        system = (
            "You are an AI daily planning assistant. "
            "Write a 3-sentence morning briefing. Be direct and actionable. "
            "Highlight what is most urgent first."
        )
        user = f"Tasks:\n{tasks}\n\nCalendar events:\n{events}"
        return await self.complete(system, user, max_tokens=150)
