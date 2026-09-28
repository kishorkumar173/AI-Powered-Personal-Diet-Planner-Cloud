"""
Cloud Object Storage Service Abstraction Layer
Supports:
1. LocalStorageService (Local filesystem simulating Cloud Object Storage / S3 / GCS Buckets)
2. FirebaseCloudStorageService (Production Google Cloud Storage / Firebase Storage Bucket)
"""

import os
import shutil
import hashlib
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple, BinaryIO

logger = logging.getLogger("storage_service")


class BaseStorageService(ABC):
    @abstractmethod
    def save_file(self, user_id: str, filename: str, file_obj: BinaryIO, content_type: str) -> Dict[str, Any]:
        """Saves a binary file to object storage and returns metadata (storage_path, size, checksum)."""
        pass

    @abstractmethod
    def get_file(self, storage_path: str) -> Optional[Tuple[BinaryIO, str]]:
        """Retrieves a file stream and content type given its storage path."""
        pass

    @abstractmethod
    def delete_file(self, storage_path: str) -> bool:
        """Deletes an object from storage."""
        pass


class LocalStorageService(BaseStorageService):
    """Simulates Cloud Object Storage (S3/GCS) locally using partitioned filesystem directories."""
    def __init__(self, base_dir: str = "./uploads"):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def _get_user_dir(self, user_id: str) -> str:
        # User-partitioned storage: simulating bucket/users/<user_id>/...
        user_dir = os.path.join(self.base_dir, user_id)
        os.makedirs(user_dir, exist_ok=True)
        return user_dir

    def save_file(self, user_id: str, filename: str, file_obj: BinaryIO, content_type: str) -> Dict[str, Any]:
        user_dir = self._get_user_dir(user_id)
        # Sanitize filename and create unique storage path
        safe_filename = "".join(c for c in filename if c.isalnum() or c in "._- ")
        unique_prefix = hashlib.md5(f"{user_id}_{filename}_{os.urandom(8)}".encode()).hexdigest()[:8]
        stored_filename = f"{unique_prefix}_{safe_filename}"
        target_path = os.path.join(user_dir, stored_filename)

        sha256 = hashlib.sha256()
        size = 0

        with open(target_path, "wb") as f_out:
            while chunk := file_obj.read(1024 * 64):
                f_out.write(chunk)
                sha256.update(chunk)
                size += len(chunk)

        rel_path = os.path.relpath(target_path, self.base_dir)

        return {
            "storage_path": rel_path,
            "full_path": target_path,
            "file_size": size,
            "checksum_sha256": sha256.hexdigest(),
            "content_type": content_type,
            "storage_provider": "local_simulated_bucket"
        }

    def get_file(self, storage_path: str) -> Optional[Tuple[BinaryIO, str]]:
        target_path = os.path.join(self.base_dir, storage_path)
        if not os.path.exists(target_path):
            return None
        # Return open file handle and guessed mime
        f = open(target_path, "rb")
        return f, "application/octet-stream"

    def delete_file(self, storage_path: str) -> bool:
        target_path = os.path.join(self.base_dir, storage_path)
        if os.path.exists(target_path):
            try:
                os.remove(target_path)
                return True
            except OSError as e:
                logger.error(f"Error removing file {target_path}: {e}")
                return False
        return False


class FirebaseCloudStorageService(BaseStorageService):
    """Production Object Storage using Firebase Storage (Google Cloud Storage Bucket)."""
    def __init__(self, bucket_name: Optional[str] = None):
        try:
            import firebase_admin
            from firebase_admin import storage
            self.bucket = storage.bucket(bucket_name)
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Storage: {e}")
            raise e

    def save_file(self, user_id: str, filename: str, file_obj: BinaryIO, content_type: str) -> Dict[str, Any]:
        safe_filename = "".join(c for c in filename if c.isalnum() or c in "._- ")
        unique_prefix = hashlib.md5(f"{user_id}_{filename}_{os.urandom(8)}".encode()).hexdigest()[:8]
        blob_path = f"users/{user_id}/{unique_prefix}_{safe_filename}"
        
        blob = self.bucket.blob(blob_path)
        file_obj.seek(0)
        blob.upload_from_file(file_obj, content_type=content_type)
        
        return {
            "storage_path": blob_path,
            "file_size": blob.size,
            "checksum_sha256": blob.md5_hash,
            "content_type": content_type,
            "storage_provider": "gcs_firebase_bucket"
        }

    def get_file(self, storage_path: str) -> Optional[Tuple[BinaryIO, str]]:
        import io
        blob = self.bucket.blob(storage_path)
        if not blob.exists():
            return None
        stream = io.BytesIO()
        blob.download_to_file(stream)
        stream.seek(0)
        return stream, blob.content_type or "application/octet-stream"

    def delete_file(self, storage_path: str) -> bool:
        blob = self.bucket.blob(storage_path)
        if blob.exists():
            blob.delete()
            return True
        return False


# Singleton factory
_storage_instance: Optional[BaseStorageService] = None

def get_storage_service() -> BaseStorageService:
    global _storage_instance
    if _storage_instance is None:
        backend_type = os.getenv("STORAGE_BACKEND", "local").lower()
        if backend_type == "firebase":
            try:
                bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
                _storage_instance = FirebaseCloudStorageService(bucket_name)
                logger.info("Initialized Firebase Cloud Storage (GCS Bucket).")
            except Exception:
                logger.warning("Falling back to local simulated storage.")
                _storage_instance = LocalStorageService(os.getenv("LOCAL_STORAGE_DIR", "./uploads"))
        else:
            local_dir = os.getenv("LOCAL_STORAGE_DIR", "./uploads")
            _storage_instance = LocalStorageService(local_dir)
            logger.info("Initialized Local Object Storage Service (Simulated Cloud Bucket).")
    return _storage_instance
