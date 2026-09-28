"""
Dashboard Metrics Routes
Aggregates summary telemetry for the user dashboard.
"""

from fastapi import APIRouter, Depends
from cloud.database_service import get_database_service, BaseDatabaseService
from backend.models.schemas import DashboardMetricsResponse
from backend.services.auth_service import get_current_user
from ai_engine.diet_engine import calculate_nutrition_targets

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardMetricsResponse)
def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    user_id = current_user["user_id"]
    plans = db.get_user_diet_plans(user_id)
    files = db.get_user_files(user_id)

    latest_plan = plans[0] if plans else None

    # Calculate nutritional guidance based on current profile
    targets = calculate_nutrition_targets(
        weight_kg=float(current_user.get("weight", 70)),
        height_cm=float(current_user.get("height", 170)),
        age=int(current_user.get("age", 25)),
        activity_level=current_user.get("activity_level", "moderate"),
        goal=current_user.get("goal", "general_wellness")
    )

    return {
        "user": current_user,
        "latest_plan": latest_plan,
        "total_plans_saved": len(plans),
        "total_files_uploaded": len(files),
        "hydration_target_liters": targets["water_liters"],
        "daily_calorie_target": targets["target_calories"],
    }
