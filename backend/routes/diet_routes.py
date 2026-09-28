"""
Diet Plan Routes
Endpoints:
- POST   /api/diet/generate-plan
- POST   /api/diet/plans
- GET    /api/diet/plans
- GET    /api/diet/plans/{plan_id}
- DELETE /api/diet/plans/{plan_id}
- GET    /api/diet/plans/{plan_id}/export
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from cloud.database_service import get_database_service, BaseDatabaseService
from backend.models.schemas import (
    DietPlanGenerateRequest,
    DietPlanResponse,
    DietPlanSaveRequest
)
from backend.services.auth_service import get_current_user
from ai_engine.diet_engine import get_diet_plan

router = APIRouter(prefix="/api/diet", tags=["Diet Plans"])


@router.post("/generate-plan", response_model=DietPlanResponse)
def generate_diet_plan(
    req: DietPlanGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Invokes the AI Diet Recommendation Engine. Merges saved user biometric profile
    with optional on-the-fly preference overrides. Transparently falls back to the
    heuristic rule-based engine if AI APIs are unconfigured or fail.
    """
    profile_for_generation = {
        "age": current_user.get("age", 25),
        "height": current_user.get("height", 170.0),
        "weight": current_user.get("weight", 70.0),
        "activity_level": current_user.get("activity_level", "moderate"),
        "dietary_preference": req.dietary_preference or current_user.get("dietary_preference", "vegetarian"),
        "goal": req.goal or current_user.get("goal", "general_wellness"),
        "allergies": req.allergies if req.allergies is not None else current_user.get("allergies", ""),
    }

    plan = get_diet_plan(profile_for_generation)
    plan["user_id"] = current_user["user_id"]
    return plan


@router.post("/plans", response_model=DietPlanResponse, status_code=status.HTTP_201_CREATED)
def save_plan(
    req: DietPlanSaveRequest,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    plan_id = str(uuid.uuid4())
    plan_data = req.model_dump()
    plan_data["plan_id"] = plan_id
    plan_data["user_id"] = current_user["user_id"]

    saved = db.save_diet_plan(plan_data)
    return saved


@router.get("/plans", response_model=List[DietPlanResponse])
def list_user_plans(
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    """Retrieves all saved plans for the authenticated user only (user data isolation)."""
    return db.get_user_diet_plans(current_user["user_id"])


@router.get("/plans/{plan_id}", response_model=DietPlanResponse)
def get_single_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    plan = db.get_diet_plan_by_id(plan_id, current_user["user_id"])
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found or you do not have permission to view it.",
        )
    return plan


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    deleted = db.delete_diet_plan(plan_id, current_user["user_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diet plan not found or could not be deleted.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/plans/{plan_id}/export")
def export_plan_as_markdown(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
    db: BaseDatabaseService = Depends(get_database_service)
):
    plan = db.get_diet_plan_by_id(plan_id, current_user["user_id"])
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found.")

    summary = plan["nutrition_summary"]
    md_content = f"""# Personalized Cloud Diet Plan
**User**: {current_user['name']}
**Preference**: {plan['dietary_preference'].title()}
**Goal**: {plan['goal'].replace('_', ' ').title()}
**Engine Source**: {plan['source']}
**Date Generated**: {plan.get('created_at', 'N/A')}

---

## Daily Nutritional Summary
- **Target Calories**: {summary.get('target_calories')} kcal
- **Actual Calories**: {summary.get('total_calories')} kcal
- **Macronutrients**: Protein: {summary.get('total_protein_g')}g | Carbs: {summary.get('total_carbs_g')}g | Fats: {summary.get('total_fats_g')}g
- **Hydration Target**: {plan.get('hydration_reminder', 'Drink adequate water.')}

---

## Meal Schedule
### 1. Breakfast
- **Dish**: {plan['breakfast']['name']}
- **Portion**: {plan['breakfast']['portion']}
- **Macros**: {plan['breakfast']['calories']} kcal | P: {plan['breakfast']['protein_g']}g | C: {plan['breakfast']['carbs_g']}g | F: {plan['breakfast']['fats_g']}g

### 2. Lunch
- **Dish**: {plan['lunch']['name']}
- **Portion**: {plan['lunch']['portion']}
- **Macros**: {plan['lunch']['calories']} kcal | P: {plan['lunch']['protein_g']}g | C: {plan['lunch']['carbs_g']}g | F: {plan['lunch']['fats_g']}g

### 3. Snack
- **Dish**: {plan['snack']['name']}
- **Portion**: {plan['snack']['portion']}
- **Macros**: {plan['snack']['calories']} kcal | P: {plan['snack']['protein_g']}g | C: {plan['snack']['carbs_g']}g | F: {plan['snack']['fats_g']}g

### 4. Dinner
- **Dish**: {plan['dinner']['name']}
- **Portion**: {plan['dinner']['portion']}
- **Macros**: {plan['dinner']['calories']} kcal | P: {plan['dinner']['protein_g']}g | C: {plan['dinner']['carbs_g']}g | F: {plan['dinner']['fats_g']}g

---
*Notice: {plan.get('disclaimer', '')}*
"""
    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=diet_plan_{plan_id[:8]}.md"}
    )
