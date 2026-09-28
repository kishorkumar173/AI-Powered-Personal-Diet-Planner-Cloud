"""
User Profile Routes
Endpoints:
- GET /api/profile
- PUT /api/profile
"""

from fastapi import APIRouter, Depends
from cloud.database_service import get_database_service, BaseDatabaseService
from backend.models.schemas import UserProfileResponse, UserProfileUpdateRequest
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile"])


@router.get("", response_model=UserProfileResponse)
def read_profile(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("", response_model=UserProfileResponse)
def update_profile(
    req: UserProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    update_data = req.model_dump(exclude_unset=True)
    updated_user = db.update_user_profile(current_user["user_id"], update_data)
    return updated_user
