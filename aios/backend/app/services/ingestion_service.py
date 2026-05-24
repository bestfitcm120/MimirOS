"""
Ingestion Service
Accepts raw file bytes, extracts text, chunks it, embeds each chunk,
and stores everything linked to a project.
"""
from __future__ import annotations

import hashlib
import io
from typing import Optional
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.models.file import File
from app.models.document import Document, DocumentChunk
from app.services.embedding_service import EmbeddingService

log = structlog.get_logger()

_embedding_svc: Optional[EmbeddingService] = None

def _get_embedding_svc() -> EmbeddingService:
    global _embedding_svc
    if _embedding_svc is None:
        _embedding_svc = EmbeddingService()
    return _embedding_svc


# ── Text extraction ───────────────────────────────────────────────────────────

def _extract_pdf(content: bytes) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        log.warning("PDF extraction failed", error=str(e))
        return ""


def _extract_docx(content: bytes) -> str:
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        log.warning("DOCX extraction failed", error=str(e))
        return ""


def _detect_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return {
        "pdf": "pdf", "docx": "docx", "doc": "docx",
        "txt": "text", "md": "markdown",
        "py": "code", "ino": "code", "cpp": "code", "c": "code",
        "h": "code", "js": "code", "ts": "code",
        "xlsx": "spreadsheet", "csv": "spreadsheet",
        "png": "image", "jpg": "image", "jpeg": "image",
        "dxf": "cad", "step": "cad", "stl": "cad",
    }.get(ext, "unknown")


def _extract_text(content: bytes, file_type: str, filename: str) -> str:
    if file_type == "pdf":
        return _extract_pdf(content)
    if file_type == "docx":
        return _extract_docx(content)
    if file_type in ("code", "text", "markdown"):
        try:
            return content.decode("utf-8", errors="replace")
        except Exception:
            return ""
    return ""


# ── Chunking ──────────────────────────────────────────────────────────────────

def _chunk(text: str, chunk_words: int = 400, overlap_words: int = 40) -> list[str]:
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_words])
        if chunk.strip():
            chunks.append(chunk)
        i += chunk_words - overlap_words
    return chunks


# ── Main service ──────────────────────────────────────────────────────────────

class IngestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.emb = _get_embedding_svc()

    async def ingest_file(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        user_id: uuid.UUID,
        project_id: Optional[uuid.UUID] = None,
    ) -> dict:
        checksum = hashlib.sha256(content).hexdigest()
        file_type = _detect_type(filename)
        storage_key = f"files/{user_id}/{uuid.uuid4()}/{filename}"

        # Extract text
        text = _extract_text(content, file_type, filename)

        # Embed whole document (best-effort — skipped if provider=none)
        doc_embedding = None
        if text and self.emb.is_available():
            doc_embedding = await self.emb.embed(text[:2000])

        # Persist document record
        doc = Document(
            user_id=user_id,
            project_id=project_id,
            title=filename,
            doc_type=file_type,
            storage_key=storage_key,
            content_text=text[:50_000] if text else None,
            word_count=len(text.split()) if text else 0,
            embedding=doc_embedding,
        )
        self.db.add(doc)
        await self.db.flush()   # get doc.id

        # Chunk + embed
        chunks = _chunk(text) if text else []
        if chunks and self.emb.is_available():
            embeddings = await self.emb.embed_batch(chunks[:200])
        else:
            embeddings = [None] * len(chunks)

        for idx, (chunk_text, emb) in enumerate(zip(chunks[:200], embeddings)):
            self.db.add(DocumentChunk(
                document_id=doc.id,
                chunk_index=idx,
                content=chunk_text,
                embedding=emb,
            ))

        # File record
        file_rec = File(
            user_id=user_id,
            project_id=project_id,
            document_id=doc.id,
            filename=filename,
            file_type=file_type,
            storage_key=storage_key,
            file_size_bytes=len(content),
            checksum=checksum,
        )
        self.db.add(file_rec)
        await self.db.commit()
        await self.db.refresh(file_rec)

        log.info(
            "File ingested",
            filename=filename,
            type=file_type,
            words=doc.word_count,
            chunks=len(chunks),
            embedded=self.emb.is_available(),
        )
        return {
            "file_id":     str(file_rec.id),
            "document_id": str(doc.id),
            "filename":    filename,
            "file_type":   file_type,
            "word_count":  doc.word_count,
            "chunks":      len(chunks),
            "embedded":    self.emb.is_available(),
            "embed_dim":   self.emb.vector_dim(),
        }
