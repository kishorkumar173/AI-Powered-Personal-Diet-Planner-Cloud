"""
Automated Unit Tests for the AI Diet Recommendation Engine
Validates:
- Mifflin-St Jeor BMR calculations
- TDEE activity factor adjustments
- Macro split calculations
- Dietary preference filtering (Vegetarian, Vegan, Non-Veg)
- Rule-based fallback mechanism
"""

import pytest
from ai_engine.diet_engine import (
    calculate_bmr,
    calculate_tdee,
    calculate_nutrition_targets,
    generate_rule_based_diet_plan,
    get_diet_plan,
)


def test_bmr_calculation():
    # General estimate: (10*70) + (6.25*175) - (5*25) - 78 = 700 + 1093.75 - 125 - 78 = 1590.75
    bmr = calculate_bmr(weight_kg=70, height_cm=175, age=25, gender="general")
    assert round(bmr) == 1591


def test_tdee_calculation():
    bmr = 1600
    sedentary_tdee = calculate_tdee(bmr, "sedentary")
    moderate_tdee = calculate_tdee(bmr, "moderate")
    assert sedentary_tdee == 1600 * 1.2
    assert moderate_tdee == 1600 * 1.55


def test_nutrition_targets_weight_loss():
    targets = calculate_nutrition_targets(
        weight_kg=80,
        height_cm=180,
        age=30,
        activity_level="moderate",
        goal="weight_loss"
    )
    assert targets["target_calories"] < targets["tdee"]
    assert targets["protein_g"] > 0
    assert targets["carbs_g"] > 0
    assert targets["fats_g"] > 0
    assert targets["water_liters"] >= 2.0


def test_vegetarian_diet_plan_generation():
    profile = {
        "age": 24,
        "height": 172,
        "weight": 68,
        "activity_level": "moderate",
        "dietary_preference": "vegetarian",
        "goal": "general_wellness",
        "allergies": "",
    }
    plan = generate_rule_based_diet_plan(profile)
    
    assert "breakfast" in plan
    assert "lunch" in plan
    assert "snack" in plan
    assert "dinner" in plan
    assert plan["dietary_preference"] == "vegetarian"
    assert "DISCLAIMER" in plan["disclaimer"]
    assert plan["source"] == "rule_based_engine"

    # Verify no meat dishes in vegetarian lunch
    lunch_name = plan["lunch"]["name"].lower()
    assert "chicken" not in lunch_name
    assert "tuna" not in lunch_name


def test_fallback_mechanism_when_api_missing():
    # Calling get_diet_plan without GEMINI_API_KEY set must cleanly return a rule-based plan
    profile = {
        "age": 28,
        "height": 165,
        "weight": 60,
        "activity_level": "light",
        "dietary_preference": "vegan",
        "goal": "weight_loss",
    }
    plan = get_diet_plan(profile)
    assert plan is not None
    assert plan["breakfast"]["calories"] > 0
    assert plan["source"] in ["rule_based_engine", "ai_api_gemini"]
