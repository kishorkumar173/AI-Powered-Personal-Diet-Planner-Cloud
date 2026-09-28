"""
Pydantic Request & Response Data Schemas
Enforces strict input validation, type safety, and clean API contracts.
Uses standard regex for email validation to avoid external binary dependencies.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ---------------- Auth Schemas ----------------

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=6, max_length=100)
    age: Optional[int] = Field(25, ge=10, le=120)
    height: Optional[float] = Field(175.0, ge=50.0, le=250.0, description="Height in cm")
    weight: Optional[float] = Field(70.0, ge=20.0, le=300.0, description="Weight in kg")
    activity_level: Optional[str] = Field("moderate")
    dietary_preference: Optional[str] = Field("vegetarian")
    goal: Optional[str] = Field("general_wellness")
    allergies: Optional[str] = Field("")


class UserLoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str


# ---------------- Profile Schemas ----------------

class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=120)
    height: Optional[float] = Field(None, ge=50.0, le=250.0)
    weight: Optional[float] = Field(None, ge=20.0, le=300.0)
    activity_level: Optional[str] = None
    dietary_preference: Optional[str] = None
    goal: Optional[str] = None
    allergies: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    age: int
    height: float
    weight: float
    activity_level: str
    dietary_preference: str
    goal: str
    allergies: str
    created_at: str


# ---------------- Diet Plan Schemas ----------------

class MealItem(BaseModel):
    name: str
    calories: int
    protein_g: int
    carbs_g: int
    fats_g: int
    portion: str


class NutritionSummary(BaseModel):
    target_calories: int
    total_calories: int
    target_protein_g: Optional[int] = None
    total_protein_g: int
    target_carbs_g: Optional[int] = None
    total_carbs_g: int
    target_fats_g: Optional[int] = None
    total_fats_g: int
    bmr: Optional[int] = None
    tdee: Optional[int] = None


class DietPlanGenerateRequest(BaseModel):
    dietary_preference: Optional[str] = None
    goal: Optional[str] = None
    allergies: Optional[str] = None


class DietPlanResponse(BaseModel):
    plan_id: Optional[str] = None
    user_id: Optional[str] = None
    breakfast: MealItem
    lunch: MealItem
    snack: MealItem
    dinner: MealItem
    nutrition_summary: NutritionSummary
    hydration_reminder: str
    dietary_preference: str
    goal: str
    disclaimer: Optional[str] = (
        "DISCLAIMER: This diet plan is generated for educational and wellness demonstration purposes "
        "only and does not constitute medical or clinical nutrition advice. Consult a healthcare professional."
    )
    source: str
    created_at: Optional[str] = None


class DietPlanSaveRequest(BaseModel):
    breakfast: MealItem
    lunch: MealItem
    snack: MealItem
    dinner: MealItem
    nutrition_summary: NutritionSummary
    hydration_reminder: str
    dietary_preference: str
    goal: str
    source: str = "rule_based_engine"


# ---------------- Object Storage Schemas ----------------

class UserFileResponse(BaseModel):
    file_id: str
    user_id: str
    filename: str
    storage_path: str
    file_size: int
    content_type: str
    uploaded_at: str


# ---------------- Dashboard Schemas ----------------

class DashboardMetricsResponse(BaseModel):
    user: UserProfileResponse
    latest_plan: Optional[DietPlanResponse] = None
    total_plans_saved: int
    total_files_uploaded: int
    hydration_target_liters: float
    daily_calorie_target: int
