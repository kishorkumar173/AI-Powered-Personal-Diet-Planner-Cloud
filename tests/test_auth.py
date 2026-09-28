"""
Automated Integration Tests for Cloud Authentication & Route Guards
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)


def test_user_registration_and_login_flow():
    unique_id = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_id}@example.com"
    reg_payload = {
        "name": "Jordan Cloud",
        "email": email,
        "password": "Password123!",
        "age": 26,
        "height": 178.0,
        "weight": 72.0,
        "activity_level": "moderate",
        "dietary_preference": "vegetarian",
        "goal": "general_wellness",
        "allergies": "peanuts"
    }

    # 1. Register new user
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    data = res_reg.json()
    assert "access_token" in data
    assert data["email"] == email

    # 2. Reject duplicate email
    res_dup = client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"].lower()

    # 3. Successful login
    login_payload = {"email": email, "password": "Password123!"}
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert token

    # 4. Reject invalid password
    res_bad_login = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword!"})
    assert res_bad_login.status_code == 401

    # 5. Access protected route with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == email


def test_unauthorized_dashboard_access():
    # Attempting to access protected endpoints without token must return 401/403
    res = client.get("/api/dashboard")
    assert res.status_code in [401, 403]
