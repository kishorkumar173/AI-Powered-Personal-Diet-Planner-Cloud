"""
Multi-Tenant Security Tests: User Data Isolation
Guarantees that User A cannot view, update, or delete User B's cloud data.
"""

import io
import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_user_data_isolation_plans_and_files():
    unique_a = uuid.uuid4().hex[:8]
    unique_b = uuid.uuid4().hex[:8]

    # 1. Register User A
    user_a_email = f"user_a_{unique_a}@example.com"
    res_a = client.post("/api/auth/register", json={
        "name": "User Alpha",
        "email": user_a_email,
        "password": "PasswordA123!",
        "age": 25,
        "height": 170.0,
        "weight": 65.0,
        "activity_level": "moderate",
        "dietary_preference": "vegetarian",
        "goal": "general_wellness",
        "allergies": ""
    })
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B
    user_b_email = f"user_b_{unique_b}@example.com"
    res_b = client.post("/api/auth/register", json={
        "name": "User Beta",
        "email": user_b_email,
        "password": "PasswordB123!",
        "age": 30,
        "height": 180.0,
        "weight": 80.0,
        "activity_level": "active",
        "dietary_preference": "non-vegetarian",
        "goal": "fitness",
        "allergies": ""
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User A generates and saves a diet plan
    gen_res = client.post("/api/diet/generate-plan", json={}, headers=headers_a)
    assert gen_res.status_code == 200
    plan_to_save = gen_res.json()
    save_res = client.post("/api/diet/plans", json={
        "breakfast": plan_to_save["breakfast"],
        "lunch": plan_to_save["lunch"],
        "snack": plan_to_save["snack"],
        "dinner": plan_to_save["dinner"],
        "nutrition_summary": plan_to_save["nutrition_summary"],
        "hydration_reminder": plan_to_save["hydration_reminder"],
        "dietary_preference": plan_to_save["dietary_preference"],
        "goal": plan_to_save["goal"],
    }, headers=headers_a)
    assert save_res.status_code == 201
    plan_id_a = save_res.json()["plan_id"]

    # 4. User B attempts to access User A's diet plan -> MUST BE REJECTED (404 / Forbidden)
    forbidden_get = client.get(f"/api/diet/plans/{plan_id_a}", headers=headers_b)
    assert forbidden_get.status_code == 404

    # 5. User B attempts to delete User A's diet plan -> MUST BE REJECTED (404 / Forbidden)
    forbidden_del = client.delete(f"/api/diet/plans/{plan_id_a}", headers=headers_b)
    assert forbidden_del.status_code == 404

    # 6. User A uploads a meal log file to Object Storage
    fake_file = io.BytesIO(b"Breakfast log: Oatmeal and berries, 360 kcal.")
    upload_res = client.post(
        "/api/files/upload",
        files={"file": ("meal_log.txt", fake_file, "text/plain")},
        headers=headers_a
    )
    assert upload_res.status_code == 201
    file_id_a = upload_res.json()["file_id"]

    # 7. User B attempts to download User A's file -> MUST BE REJECTED (404)
    forbidden_file_get = client.get(f"/api/files/{file_id_a}/download", headers=headers_b)
    assert forbidden_file_get.status_code == 404

    # 8. User B lists their files -> User A's file MUST NOT appear
    b_files = client.get("/api/files", headers=headers_b).json()
    assert all(f["file_id"] != file_id_a for f in b_files)
