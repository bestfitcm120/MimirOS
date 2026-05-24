from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from uuid import UUID
import os
import hashlib
import aiofiles

from app.database import get_db
from app.models import File
from app.schemas import FileCreate, File as FileSchema

router = APIRouter()

FILE_STORAGE = os.getenv("FILE_STORAGE_PATH", "./files")
os.makedirs(FILE_STORAGE, exist_ok=True)

@router.get("", response_model=List[FileSchema])
async def list_files(project_id: Optional[UUID] = None, db: AsyncSession = Depends(get_db)):
    query = select(File).order_by(File.created_at.desc())
    if project_id:
        query = query.where(File.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/upload")
async def upload_file(
    upload_file: UploadFile = FastAPIFile(...),
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    file_hash = hashlib.md5()
    content = await upload_file.read()
    file_hash.update(content)
    checksum = file_hash.hexdigest()

    file_path = os.path.join(FILE_STORAGE, f"{checksum}_{upload_file.filename}")
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    db_file = File(
        filename=upload_file.filename,
        file_path=file_path,
        file_type=upload_file.content_type,
        size_bytes=len(content),
        checksum=checksum,
        project_id=project_id,
        user_id=None
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file

@router.get("/{file_id}", response_model=FileSchema)
async def get_file(file_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@router.delete("/{file_id}")
async def delete_file(file_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id))
    file = result.scalar_one_or_none()
    if file and os.path.exists(file.file_path):
        os.remove(file.file_path)
    await db.execute(delete(File).where(File.id == file_id))
    await db.commit()
    return {"deleted": True}
