from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.file import File
from app.models.document import Document
from app.services.ingestion_service import IngestService
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class FileResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_type: Optional[str]
    file_size_bytes: Optional[int]
    project_id: Optional[uuid.UUID]
    version: int
    is_latest: bool

    class Config:
        from_attributes = True

@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    user_id: uuid.UUID = Form(...),
    project_id: Optional[uuid.UUID] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    svc = IngestService(db)
    result = await svc.ingest_file(
        content=content,
        filename=file.filename,
        content_type=file.content_type,
        user_id=user_id,
        project_id=project_id
    )
    return result

@router.get("/", response_model=List[FileResponse])
async def list_files(
    user_id: uuid.UUID,
    project_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(File).where(File.user_id == user_id, File.is_latest == True)
    if project_id:
        q = q.where(File.project_id == project_id)
    q = q.order_by(desc(File.created_at))
    result = await db.execute(q)
    return result.scalars().all()

@router.delete("/{file_id}")
async def delete_file(file_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id))
    f = result.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    await db.delete(f)
    await db.commit()
    return {"status": "deleted"}
