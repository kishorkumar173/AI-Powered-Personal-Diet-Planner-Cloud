"""
Cloud Database Service Abstraction Layer
Supports:
1. SQLiteDatabaseService (Zero-cost, local relational DB for immediate simulation & offline testing)
2. FirestoreDatabaseService (Managed NoSQL Cloud Database via Firebase/GCP)
"""

import os
import sqlite3
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("database_service")


class BaseDatabaseService(ABC):
    @abstractmethod
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def save_diet_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_user_diet_plans(self, user_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_diet_plan_by_id(self, plan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def delete_diet_plan(self, plan_id: str, user_id: str) -> bool:
        pass

    @abstractmethod
    def save_file_metadata(self, file_data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_user_files(self, user_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_file_metadata(self, file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def delete_file_metadata(self, file_id: str, user_id: str) -> bool:
        pass


class SQLiteDatabaseService(BaseDatabaseService):
    def __init__(self, db_path: str = "./cloud_diet_planner.db"):
        self.db_path = db_path
        self._init_tables()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    hashed_password TEXT NOT NULL,
                    age INTEGER DEFAULT 25,
                    height REAL DEFAULT 170.0,
                    weight REAL DEFAULT 70.0,
                    activity_level TEXT DEFAULT 'moderate',
                    dietary_preference TEXT DEFAULT 'vegetarian',
                    goal TEXT DEFAULT 'general_wellness',
                    allergies TEXT DEFAULT '',
                    created_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS diet_plans (
                    plan_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    breakfast TEXT NOT NULL,
                    lunch TEXT NOT NULL,
                    snack TEXT NOT NULL,
                    dinner TEXT NOT NULL,
                    nutrition_summary TEXT NOT NULL,
                    hydration_reminder TEXT NOT NULL,
                    dietary_preference TEXT NOT NULL,
                    goal TEXT NOT NULL,
                    source TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_files (
                    file_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    storage_path TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    content_type TEXT NOT NULL,
                    uploaded_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            """)
            conn.commit()

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            created_at = datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT INTO users (
                    user_id, name, email, hashed_password, age, height, weight,
                    activity_level, dietary_preference, goal, allergies, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_data["user_id"],
                user_data["name"],
                user_data["email"].lower().strip(),
                user_data["hashed_password"],
                user_data.get("age", 25),
                user_data.get("height", 170.0),
                user_data.get("weight", 70.0),
                user_data.get("activity_level", "moderate"),
                user_data.get("dietary_preference", "vegetarian"),
                user_data.get("goal", "general_wellness"),
                user_data.get("allergies", ""),
                created_at
            ))
            conn.commit()
            return self.get_user_by_id(user_data["user_id"])

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users SET
                    name = COALESCE(?, name),
                    age = COALESCE(?, age),
                    height = COALESCE(?, height),
                    weight = COALESCE(?, weight),
                    activity_level = COALESCE(?, activity_level),
                    dietary_preference = COALESCE(?, dietary_preference),
                    goal = COALESCE(?, goal),
                    allergies = COALESCE(?, allergies)
                WHERE user_id = ?
            """, (
                profile_data.get("name"),
                profile_data.get("age"),
                profile_data.get("height"),
                profile_data.get("weight"),
                profile_data.get("activity_level"),
                profile_data.get("dietary_preference"),
                profile_data.get("goal"),
                profile_data.get("allergies"),
                user_id
            ))
            conn.commit()
            return self.get_user_by_id(user_id)

    def save_diet_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO diet_plans (
                    plan_id, user_id, breakfast, lunch, snack, dinner,
                    nutrition_summary, hydration_reminder, dietary_preference,
                    goal, source, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                plan_data["plan_id"],
                plan_data["user_id"],
                json.dumps(plan_data["breakfast"]),
                json.dumps(plan_data["lunch"]),
                json.dumps(plan_data["snack"]),
                json.dumps(plan_data["dinner"]),
                json.dumps(plan_data["nutrition_summary"]),
                plan_data.get("hydration_reminder", ""),
                plan_data.get("dietary_preference", "vegetarian"),
                plan_data.get("goal", "general_wellness"),
                plan_data.get("source", "rule_based_engine"),
                datetime.utcnow().isoformat()
            ))
            conn.commit()
            return self.get_diet_plan_by_id(plan_data["plan_id"], plan_data["user_id"])

    def get_user_diet_plans(self, user_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM diet_plans WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                item["breakfast"] = json.loads(item["breakfast"])
                item["lunch"] = json.loads(item["lunch"])
                item["snack"] = json.loads(item["snack"])
                item["dinner"] = json.loads(item["dinner"])
                item["nutrition_summary"] = json.loads(item["nutrition_summary"])
                item["disclaimer"] = (
                    "DISCLAIMER: This diet plan is generated for educational and wellness demonstration purposes "
                    "only and does not constitute medical or clinical nutrition advice. Consult a healthcare professional."
                )
                results.append(item)
            return results

    def get_diet_plan_by_id(self, plan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Enforce user_id isolation
            cursor.execute("SELECT * FROM diet_plans WHERE plan_id = ? AND user_id = ?", (plan_id, user_id))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            item["breakfast"] = json.loads(item["breakfast"])
            item["lunch"] = json.loads(item["lunch"])
            item["snack"] = json.loads(item["snack"])
            item["dinner"] = json.loads(item["dinner"])
            item["nutrition_summary"] = json.loads(item["nutrition_summary"])
            item["disclaimer"] = (
                "DISCLAIMER: This diet plan is generated for educational and wellness demonstration purposes "
                "only and does not constitute medical or clinical nutrition advice. Consult a healthcare professional."
            )
            return item

    def delete_diet_plan(self, plan_id: str, user_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM diet_plans WHERE plan_id = ? AND user_id = ?", (plan_id, user_id))
            conn.commit()
            return cursor.rowcount > 0

    def save_file_metadata(self, file_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_files (
                    file_id, user_id, filename, storage_path, file_size, content_type, uploaded_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                file_data["file_id"],
                file_data["user_id"],
                file_data["filename"],
                file_data["storage_path"],
                file_data["file_size"],
                file_data["content_type"],
                datetime.utcnow().isoformat()
            ))
            conn.commit()
            return self.get_file_metadata(file_data["file_id"], file_data["user_id"])

    def get_user_files(self, user_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_files WHERE user_id = ? ORDER BY uploaded_at DESC", (user_id,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_file_metadata(self, file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Enforce user isolation
            cursor.execute("SELECT * FROM user_files WHERE file_id = ? AND user_id = ?", (file_id, user_id))
            row = cursor.fetchone()
            return dict(row) if row else None

    def delete_file_metadata(self, file_id: str, user_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user_files WHERE file_id = ? AND user_id = ?", (file_id, user_id))
            conn.commit()
            return cursor.rowcount > 0


class FirestoreDatabaseService(BaseDatabaseService):
    """Production Cloud Firestore NoSQL Database adapter."""
    def __init__(self, cred_path: Optional[str] = None):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            if not firebase_admin._apps:
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()
            self.db = firestore.client()
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {e}. Falling back to SQLite.")
            raise e

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(user_data)
        data["created_at"] = datetime.utcnow().isoformat()
        self.db.collection("users").document(data["user_id"]).set(data)
        return self.get_user_by_id(data["user_id"])

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        docs = self.db.collection("users").where("email", "==", email.lower().strip()).limit(1).stream()
        for doc in docs:
            return doc.to_dict()
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection("users").document(user_id).get()
        return doc.to_dict() if doc.exists else None

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        self.db.collection("users").document(user_id).update(profile_data)
        return self.get_user_by_id(user_id)

    def save_diet_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(plan_data)
        data["created_at"] = datetime.utcnow().isoformat()
        self.db.collection("diet_plans").document(data["plan_id"]).set(data)
        return data

    def get_user_diet_plans(self, user_id: str) -> List[Dict[str, Any]]:
        docs = self.db.collection("diet_plans").where("user_id", "==", user_id).order_by("created_at", direction="DESCENDING").stream()
        return [doc.to_dict() for doc in docs]

    def get_diet_plan_by_id(self, plan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection("diet_plans").document(plan_id).get()
        if doc.exists:
            data = doc.to_dict()
            if data.get("user_id") == user_id:
                return data
        return None

    def delete_diet_plan(self, plan_id: str, user_id: str) -> bool:
        doc_ref = self.db.collection("diet_plans").document(plan_id)
        doc = doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.delete()
            return True
        return False

    def save_file_metadata(self, file_data: Dict[str, Any]) -> Dict[str, Any]:
        data = dict(file_data)
        data["uploaded_at"] = datetime.utcnow().isoformat()
        self.db.collection("user_files").document(data["file_id"]).set(data)
        return data

    def get_user_files(self, user_id: str) -> List[Dict[str, Any]]:
        docs = self.db.collection("user_files").where("user_id", "==", user_id).order_by("uploaded_at", direction="DESCENDING").stream()
        return [doc.to_dict() for doc in docs]

    def get_file_metadata(self, file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection("user_files").document(file_id).get()
        if doc.exists:
            data = doc.to_dict()
            if data.get("user_id") == user_id:
                return data
        return None

    def delete_file_metadata(self, file_id: str, user_id: str) -> bool:
        doc_ref = self.db.collection("user_files").document(file_id)
        doc = doc_ref.get()
        if doc.exists and doc.to_dict().get("user_id") == user_id:
            doc_ref.delete()
            return True
        return False


# Singleton factory
_db_instance: Optional[BaseDatabaseService] = None

def get_database_service() -> BaseDatabaseService:
    global _db_instance
    if _db_instance is None:
        backend_type = os.getenv("DB_BACKEND", "sqlite").lower()
        if backend_type == "firestore":
            try:
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
                _db_instance = FirestoreDatabaseService(cred_path)
                logger.info("Initialized Cloud Firestore Database Service.")
            except Exception:
                logger.warning("Falling back to local SQLite Database Service.")
                _db_instance = SQLiteDatabaseService(os.getenv("SQLITE_DB_PATH", "./cloud_diet_planner.db"))
        else:
            db_path = os.getenv("SQLITE_DB_PATH", "./cloud_diet_planner.db")
            _db_instance = SQLiteDatabaseService(db_path)
            logger.info("Initialized SQLite Database Service (Simulated Cloud DB).")
    return _db_instance
