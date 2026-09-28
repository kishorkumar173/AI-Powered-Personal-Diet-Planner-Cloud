"""
AI Diet Recommendation Engine
Implements:
1. Scientific Heuristic Rule-Based Engine (BMR via Mifflin-St Jeor, TDEE, macronutrient balance)
2. Optional Generative AI API Integration (Google Gemini / OpenAI)
3. Transparent Fallback Mechanism ensuring zero failure if API is unavailable or offline
4. Mandatory Health & Wellness Educational Disclaimer
"""

import os
import json
import random
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("diet_engine")

DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), "food_data.json")

DISCLAIMER_TEXT = (
    "DISCLAIMER: This diet plan is generated for educational and wellness demonstration purposes "
    "only and does not constitute medical or clinical nutrition advice. Consult a licensed healthcare "
    "professional or registered dietitian before making significant dietary modifications."
)

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_CALORIE_ADJUSTMENTS = {
    "weight_loss": -500,
    "weight_gain": 400,
    "maintenance": 0,
    "general_wellness": 0,
    "fitness": 200,
}


def load_food_data() -> Dict[str, list]:
    try:
        with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load food_data.json: {e}")
        return {"breakfast": [], "lunch": [], "snack": [], "dinner": []}


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str = "general") -> float:
    """Mifflin-St Jeor equation for Basal Metabolic Rate."""
    if gender.lower() == "male":
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    elif gender.lower() == "female":
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        # Balanced general estimate
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 78


def calculate_tdee(bmr: float, activity_level: str) -> float:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level.lower(), 1.375)
    return bmr * multiplier


def calculate_nutrition_targets(weight_kg: float, height_cm: float, age: int, activity_level: str, goal: str) -> Dict[str, Any]:
    bmr = calculate_bmr(weight_kg, height_cm, age)
    tdee = calculate_tdee(bmr, activity_level)
    adjustment = GOAL_CALORIE_ADJUSTMENTS.get(goal.lower(), 0)
    target_calories = max(1200, round(tdee + adjustment))

    # Macro distribution: Protein 25%, Carbs 50%, Fats 25%
    # Protein: 4 kcal/g, Carbs: 4 kcal/g, Fats: 9 kcal/g
    protein_calories = target_calories * 0.25
    carbs_calories = target_calories * 0.50
    fats_calories = target_calories * 0.25

    protein_g = round(protein_calories / 4)
    carbs_g = round(carbs_calories / 4)
    fats_g = round(fats_calories / 9)

    # Hydration target: 35ml per kg of body weight
    water_liters = round((weight_kg * 0.035), 1)

    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "target_calories": target_calories,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fats_g": fats_g,
        "water_liters": max(2.0, water_liters),
    }


def select_meal_item(category_items: list, diet_preference: str, allergy_keywords: list) -> Dict[str, Any]:
    pref = diet_preference.lower()
    compatible = []

    for item in category_items:
        # Check dietary tag match
        tags = [t.lower() for t in item.get("diet_tags", [])]
        if pref in tags or pref == "general" or pref == "non-vegetarian":
            # Check allergy exclusion
            name_lower = item["name"].lower()
            if any(allergy in name_lower for allergy in allergy_keywords if allergy.strip()):
                continue
            compatible.append(item)

    if not compatible:
        # Fallback to any item if exclusions leave zero
        compatible = category_items

    return random.choice(compatible) if compatible else {
        "name": f"Healthy Balanced {pref.capitalize()} Plate",
        "calories": 400,
        "protein_g": 20,
        "carbs_g": 50,
        "fats_g": 12,
        "portion": "Standard serving with vegetables and grains"
    }


def generate_rule_based_diet_plan(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a complete, tailored diet plan using heuristic nutritional models."""
    weight = float(user_profile.get("weight", 70))
    height = float(user_profile.get("height", 175))
    age = int(user_profile.get("age", 25))
    activity = user_profile.get("activity_level", "moderate")
    goal = user_profile.get("goal", "general_wellness")
    diet_pref = user_profile.get("dietary_preference", "vegetarian")
    allergies = [a.strip().lower() for a in user_profile.get("allergies", "").split(",") if a.strip()]

    targets = calculate_nutrition_targets(weight, height, age, activity, goal)
    food_data = load_food_data()

    breakfast = select_meal_item(food_data.get("breakfast", []), diet_pref, allergies)
    lunch = select_meal_item(food_data.get("lunch", []), diet_pref, allergies)
    snack = select_meal_item(food_data.get("snack", []), diet_pref, allergies)
    dinner = select_meal_item(food_data.get("dinner", []), diet_pref, allergies)

    actual_calories = breakfast["calories"] + lunch["calories"] + snack["calories"] + dinner["calories"]
    actual_protein = breakfast["protein_g"] + lunch["protein_g"] + snack["protein_g"] + dinner["protein_g"]
    actual_carbs = breakfast["carbs_g"] + lunch["carbs_g"] + snack["carbs_g"] + dinner["carbs_g"]
    actual_fats = breakfast["fats_g"] + lunch["fats_g"] + snack["fats_g"] + dinner["fats_g"]

    return {
        "breakfast": breakfast,
        "lunch": lunch,
        "snack": snack,
        "dinner": dinner,
        "nutrition_summary": {
            "target_calories": targets["target_calories"],
            "total_calories": actual_calories,
            "target_protein_g": targets["protein_g"],
            "total_protein_g": actual_protein,
            "target_carbs_g": targets["carbs_g"],
            "total_carbs_g": actual_carbs,
            "target_fats_g": targets["fats_g"],
            "total_fats_g": actual_fats,
            "bmr": targets["bmr"],
            "tdee": targets["tdee"],
        },
        "hydration_reminder": f"Drink at least {targets['water_liters']} liters of water spaced evenly throughout the day.",
        "dietary_preference": diet_pref,
        "goal": goal,
        "disclaimer": DISCLAIMER_TEXT,
        "source": "rule_based_engine"
    }


def generate_ai_api_diet_plan(user_profile: Dict[str, Any], api_key: str) -> Optional[Dict[str, Any]]:
    """Attempts to generate a personalized diet plan using Google Gemini API."""
    try:
        import requests
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        prompt = (
            f"You are a wellness diet assistant. Create a 1-day meal plan based on these user parameters:\n"
            f"- Age: {user_profile.get('age')}\n"
            f"- Height: {user_profile.get('height')} cm\n"
            f"- Weight: {user_profile.get('weight')} kg\n"
            f"- Activity Level: {user_profile.get('activity_level')}\n"
            f"- Dietary Preference: {user_profile.get('dietary_preference')}\n"
            f"- Goal: {user_profile.get('goal')}\n"
            f"- Allergies/Exclusions: {user_profile.get('allergies', 'None')}\n\n"
            f"Respond STRICTLY in valid JSON with this exact schema:\n"
            f"{{\n"
            f'  "breakfast": {{"name": "...", "calories": 400, "protein_g": 20, "carbs_g": 40, "fats_g": 10, "portion": "..."}},\n'
            f'  "lunch": {{"name": "...", "calories": 500, "protein_g": 30, "carbs_g": 50, "fats_g": 15, "portion": "..."}},\n'
            f'  "snack": {{"name": "...", "calories": 200, "protein_g": 10, "carbs_g": 20, "fats_g": 5, "portion": "..."}},\n'
            f'  "dinner": {{"name": "...", "calories": 550, "protein_g": 35, "carbs_g": 45, "fats_g": 18, "portion": "..."}},\n'
            f'  "hydration_reminder": "Drink at least 2.5 liters...",\n'
            f'  "nutrition_summary": {{"target_calories": 1650, "total_calories": 1650, "total_protein_g": 95, "total_carbs_g": 155, "total_fats_g": 48}}\n'
            f"}}\n"
            f"Do not include markdown or backticks."
        )

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.4,
                "response_mime_type": "application/json"
            }
        }

        resp = requests.post(url, json=payload, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            cleaned = raw_text.strip().removeprefix("```json").removesuffix("```").strip()
            parsed = json.loads(cleaned)
            parsed["disclaimer"] = DISCLAIMER_TEXT
            parsed["source"] = "ai_api_gemini"
            parsed["dietary_preference"] = user_profile.get("dietary_preference")
            parsed["goal"] = user_profile.get("goal")
            return parsed
        else:
            logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.warning(f"AI API request failed or timed out: {e}. Activating rule-based fallback.")
        return None


def get_diet_plan(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point:
    1. If GEMINI_API_KEY is configured in environment, attempt API completion.
    2. If missing, failing, or offline, automatically and gracefully fall back to the rule-based engine.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key:
        plan = generate_ai_api_diet_plan(user_profile, api_key)
        if plan:
            return plan

    # Safe fallback
    return generate_rule_based_diet_plan(user_profile)
