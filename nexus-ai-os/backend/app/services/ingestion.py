import os
import hashlib
from typing import Optional
from uuid import UUID

class IngestionService:
    def __init__(self, file_storage_path: str = "./files"):
        self.file_storage_path = file_storage_path
        os.makedirs(file_storage_path, exist_ok=True)

    async def process_file(self, file_path: str, file_id: UUID) -> dict:
        """Process uploaded file: extract text, chunk, summarize, embed"""
        result = {
            "file_id": str(file_id),
            "chunks": [],
            "summary": None,
            "error": None
        }

        try:
            # Basic text extraction based on file type
            if file_path.endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            elif file_path.endswith('.md'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                text = f"[Binary file: {os.path.basename(file_path)}]"

            # Simple chunking (will be replaced with proper chunking later)
            chunks = self._chunk_text(text, chunk_size=1000, overlap=100)
            result["chunks"] = [{"index": i, "content": c[:200] + "..."} for i, c in enumerate(chunks)]

            # Simple summary (first 500 chars as placeholder)
            result["summary"] = text[:500] + "..." if len(text) > 500 else text

        except Exception as e:
            result["error"] = str(e)

        return result

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> list:
        """Simple sliding window chunking"""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        return chunks
