"""
Cloud Object Storage Routes
Demonstrates Cloud File and Blob handling:
- POST   /api/files/upload
- GET    /api/files
- GET    /api/files/{file_id}/download
- DELETE /api/files/{file_id}
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Response
from fastapi.responses import StreamingResponse

from cloud.database_service import get_database_service, BaseDatabaseService
from cloud.storage_service import get_storage_service, BaseStorageService
from backend.models.schemas import UserFileResponse
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/api/files", tags=["Cloud Object Storage"])


@router.post("/upload", response_model=UserFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service),
    storage: BaseStorageService = Depends(get_storage_service)
):
    """
    Receives user meal photos or health logs, uploads them to Object Storage
    (simulated bucket or Firebase Storage), and stores metadata in the Cloud Database.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    # Max file size limit: 10 MB
    content_type = file.content_type or "application/octet-stream"
    user_id = current_user["user_id"]

    # Stream into storage service
    storage_meta = storage.save_file(
        user_id=user_id,
        filename=file.filename,
        file_obj=file.file,
        content_type=content_type
    )

    file_id = str(uuid.uuid4())
    db_file_record = {
        "file_id": file_id,
        "user_id": user_id,
        "filename": file.filename,
        "storage_path": storage_meta["storage_path"],
        "file_size": storage_meta["file_size"],
        "content_type": content_type,
    }

    saved_meta = db.save_file_metadata(db_file_record)
    return saved_meta


@router.get("", response_model=List[UserFileResponse])
def list_files(
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    """Lists files owned by the authenticated user only (user data isolation)."""
    return db.get_user_files(current_user["user_id"])


@router.get("/{file_id}/download")
def download_file(
    file_id: str,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service),
    storage: BaseStorageService = Depends(get_storage_service)
):
    """Retrieves file from object storage and streams it to the client."""
    meta = db.get_file_metadata(file_id, current_user["user_id"])
    if not meta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or access denied.",
        )

    file_stream_data = storage.get_file(meta["storage_path"])
    if not file_stream_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found in storage bucket.")

    stream, content_type = file_stream_data
    return StreamingResponse(
        stream,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{meta["filename"]}"'}
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: str,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service),
    storage: BaseStorageService = Depends(get_storage_service)
):
    """Deletes object from storage bucket and deletes corresponding DB metadata record."""
    meta = db.get_file_metadata(file_id, current_user["user_id"])
    if not meta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")

    storage.delete_file(meta["storage_path"])
    db.delete_file_metadata(file_id, current_user["user_id"])
    return Response(status_code=status.HTTP_204_NO_CONTENT)
