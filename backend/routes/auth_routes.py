"""
Authentication Routes
Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from cloud.database_service import get_database_service, BaseDatabaseService
from backend.models.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse
from backend.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    req: UserRegisterRequest,
    db: BaseDatabaseService = Depends(get_database_service)
):
    # Check if user already exists
    existing = db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in.",
        )

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(req.password)

    user_record = {
        "user_id": user_id,
        "name": req.name,
        "email": req.email,
        "hashed_password": hashed_pwd,
        "age": req.age,
        "height": req.height,
        "weight": req.weight,
        "activity_level": req.activity_level,
        "dietary_preference": req.dietary_preference,
        "goal": req.goal,
        "allergies": req.allergies,
    }

    db.create_user(user_record)

    token = create_access_token(data={"sub": user_id, "email": req.email, "name": req.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user_id,
        "name": req.name,
        "email": req.email,
    }


@router.post("/login", response_model=TokenResponse)
def login_user(
    req: UserLoginRequest,
    db: BaseDatabaseService = Depends(get_database_service)
):
    user = db.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials. Please verify your entries.",
        )

    token = create_access_token(data={"sub": user["user_id"], "email": user["email"], "name": user["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
    }


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return current_user
