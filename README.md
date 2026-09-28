# AI-Powered Personal Diet Planner with Cloud Storage

[![Cloud Computing](https://img.shields.io/badge/Cloud%20Computing-Capstone%20Project-blue.svg)](https://github.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB.svg)](https://react.dev)
[![Cloud Storage](https://img.shields.io/badge/Storage-Object%20%26%20NoSQL%2FRelational-orange.svg)](https://firebase.google.com)
[![Tests](https://img.shields.io/badge/Tests-8%20Passed%20100%25-brightgreen.svg)](https://docs.pytest.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An industry-oriented, multi-tier Cloud Computing application that generates tailored daily nutrition plans using biometric profiles, secures multi-tenant user data with JWT tokens, persists structured plans in a cloud database, and manages binary file assets (meal photos and health logs) in cloud object storage.

---

## 📋 Table of Contents
1. [Overview & Problem Statement](#overview--problem-statement)
2. [Key Features](#key-features)
3. [Cloud Computing Concepts Demonstrated](#cloud-computing-concepts-demonstrated)
4. [System Architecture & Data Flow](#system-architecture--data-flow)
5. [Technology Stack](#technology-stack)
6. [Database & Storage Design](#database--storage-design)
7. [AI Recommendation Engine & Fallback](#ai-recommendation-engine--fallback)
8. [REST API Documentation](#rest-api-documentation)
9. [Project Folder Structure](#project-folder-structure)
10. [Local Simulation & Quickstart](#local-simulation--quickstart)
11. [Cloud Deployment Strategy](#cloud-deployment-strategy)
12. [Testing & Verification](#testing--verification)
13. [Security & User Isolation](#security--user-isolation)
14. [Scalability & Real-World Evolution](#scalability--real-world-evolution)
15. [Academic Disclaimer](#academic-disclaimer)

---

## 💡 Overview & Problem Statement

### The Problem
Adopting a balanced, healthy dietary routine is challenging. Most people struggle to:
- Calculate accurate daily caloric expenditure (BMR and TDEE) based on their biometric parameters.
- Structure balanced macronutrient distributions (protein, carbohydrates, and healthy fats).
- Access their meal plans and dietary history seamlessly across mobile, laptop, and tablet devices.
- Retain visual meal records and dietary logs in a centralized, secure location without local storage limits.

### The Cloud Computing Solution
This project solves these challenges by engineering a **cloud-native personal diet management ecosystem**:
- **Anywhere Accessibility**: Cloud-hosted APIs and web clients allow users to retrieve, update, and manage their nutrition plans across any modern web browser.
- **Centralized Multi-Tenant Data**: Biometrics and saved meal plans are stored centrally in a cloud database with strict user isolation.
- **Dedicated Object Storage**: Meal photos, blood work PDFs, and progress logs are saved in cloud object storage rather than bloated database blobs.
- **AI Recommendation Engine with Offline Fallback**: Combines generative AI APIs (Gemini/OpenAI) with a deterministic, rule-based nutritional fallback engine based on the Mifflin-St Jeor metabolic formula.

---

## ✨ Key Features

- **User Authentication**: Secure registration, login, and password hashing using `bcrypt` and stateless `JWT (JSON Web Tokens)`.
- **Biometric Profile Profiling**: Collects age, height, weight, activity multiplier, dietary preference (Vegetarian, Vegan, Non-Veg), and goals.
- **AI-Powered Diet Plan Generator**:
  - Calculates BMR, TDEE, and daily caloric deficits/surpluses.
  - Generates balanced meals for **Breakfast, Lunch, Snack, and Dinner**.
  - Provides approximate macronutrient splits (Protein, Carbs, Fats).
  - Emits individualized daily hydration targets (35ml per kg body weight).
- **Intelligent Fallback Architecture**: Seamlessly shifts to the local heuristic rule engine if cloud AI APIs are offline, unconfigured, or rate-limited.
- **Cloud Object Storage Browser**: Upload, stream, download, and delete unstructured meal images and PDF health logs with size and format telemetry.
- **Plan History & Export**: Save generated diet plans to the cloud database and export them as clean Markdown or text documents.
- **Interactive API Documentation**: Live Swagger UI at `/docs` for testing and evaluation.

---

## ☁️ Cloud Computing Concepts Demonstrated

| Cloud Concept | Implementation in this Project |
| :--- | :--- |
| **SaaS (Software as a Service)** | The React web application delivers a complete diet management software product directly to end-users via the browser. |
| **PaaS (Platform as a Service)** | Backend deployed to containerized platforms (e.g. Render, Google Cloud Run, Railway) without managing VMs or OS kernels. |
| **IaaS (Infrastructure as a Service)** | Virtual compute nodes, networking VPCs, and storage disks underlying cloud hosting environments. |
| **Cloud Database** | Structured data storage (Users, Diet Plans, File Metadata) implemented via SQLite locally and Cloud Firestore in production. |
| **Cloud Object Storage** | Binary unstructured storage (Meal photos, PDFs) partitioned by user ID (`/uploads/{user_id}/...`) with MD5/SHA-256 checksums, simulating AWS S3 or Google Cloud Storage Buckets. |
| **Stateless Client-Server Architecture** | REST API microservice where each request contains complete authentication state inside the HTTP Authorization Bearer header. |
| **Serverless Computing** | Stateless API routes designed for serverless container deployment (Cloud Run / AWS Lambda). |
| **Scalability & Elasticity** | Stateless backend scales horizontally behind a reverse proxy / load balancer as user concurrency surges. |
| **Multi-Tenancy & Data Isolation** | Cryptographic verification ensures User A cannot view, query, or delete User B's diet plans or stored files. |
| **Secrets Management** | Sensitive parameters (JWT keys, database credentials, AI tokens) injected strictly via `.env` environment variables. |

---

## 🏛️ System Architecture & Data Flow

```
                                  +------------------------------------+
                                  |         CLIENT LAYER               |
                                  | React 18 (Vite) Single Page App    |
                                  | Responsive CSS3 / Lucide Icons     |
                                  +-----------------+------------------+
                                                    |
                                                    | HTTPS Requests + JWT Bearer
                                                    v
+-------------------------------------------------------------------------------------------------------+
|                                         APPLICATION LAYER (REST API)                                  |
|   FastAPI Application Server (Python 3.10+)                                                           |
|   ├── CORS Middleware & Security Handler                                                              |
|   ├── Auth Controller (/api/auth) ────> bcrypt Password Hashing & JWT Validation                      |
|   ├── Profile Controller (/api/profile)                                                               |
|   ├── Diet Plan Controller (/api/diet)                                                                |
|   ├── Object Storage Controller (/api/files)                                                          |
|   └── Dashboard Metrics Controller (/api/dashboard)                                                   |
+-------------------+-------------------------------+-------------------------------+-------------------+
                    |                               |                               |
                    v                               v                               v
+-------------------+---------------+ +-------------+---------------+ +-------------+---------------+
|             AI LAYER              | |        DATABASE LAYER       | |        STORAGE LAYER        |
| - Gemini 1.5 Flash API (Cloud)    | | Abstract Base Interface     | | Abstract Base Interface     |
| - Local Rule-Based Heuristic      | | ├── Local SQLite Driver     | | ├── Local Bucket Simulator  |
|   Nutritional Engine (MSJ / TDEE) | | └── Cloud Firestore Driver  | | └── Firebase / AWS S3 Blob  |
| - Automatic Fallback Orchestrator | | (Users, Plans, File Meta)   | | (Meal Photos, PDF Scans)    |
+-----------------------------------+ +-----------------------------+ +-----------------------------+
```

### Complete End-to-End Data Flow
1. **User Registration & Login**: The client submits email and password. The backend hashes the password using `bcrypt` and generates a signed `HS256` JWT token returned to the client.
2. **Profile Setup**: User biometrics (age, weight, height, activity multiplier, diet type) are stored in the Cloud Database under their unique `user_id`.
3. **Plan Generation Request**: The client requests `/api/diet/generate-plan`. The backend attempts to query the Google Gemini API. If the API key is absent or unreachable, the system automatically runs the local heuristic Mifflin-St Jeor engine.
4. **Plan Persistence**: The user reviews the plan and clicks "Save to Cloud DB". A unique `plan_id` is assigned and persisted to the cloud database.
5. **Media Upload**: The user uploads a photo of their meal. The file stream is passed to the Cloud Object Storage service, which computes a SHA-256 checksum, assigns a partitioned object path, and writes metadata to the database.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite build system, Lucide React icons, Native Fetch client.
- **Backend**: Python 3.10+, FastAPI, Uvicorn ASGI server, Pydantic V2.
- **Security**: `passlib` with `bcrypt`, `python-jose` for JWT validation, HTTPBearer middleware.
- **Database Layer**: Dual-driver abstraction (`SQLite` for zero-cost local simulation, `Google Cloud Firestore` for live cloud deployment).
- **Object Storage Layer**: Dual-driver abstraction (`LocalStorageService` simulating S3/GCS buckets, `Firebase Storage / Google Cloud Storage` for live cloud deployment).
- **AI Recommendation Engine**: Google Gemini API client with heuristic rule-based fallback based on Mifflin-St Jeor metabolic formulas.
- **Testing**: `pytest`, `httpx`, `fastapi.testclient`.

---

## 🗄️ Database & Storage Design

### Database Collections / Tables

#### 1. `users` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | TEXT (PK) | Unique UUID identifying the user account |
| `name` | TEXT | User's full display name |
| `email` | TEXT (UNIQUE) | Case-insensitive email address |
| `hashed_password` | TEXT | Secure bcrypt password hash string |
| `age` | INTEGER | User age in years |
| `height` | REAL | Height in centimeters |
| `weight` | REAL | Weight in kilograms |
| `activity_level` | TEXT | Activity multiplier (sedentary, moderate, active) |
| `dietary_preference`| TEXT | vegetarian, vegan, or non-vegetarian |
| `goal` | TEXT | weight_loss, weight_gain, general_wellness, fitness |
| `allergies` | TEXT | Comma-separated list of exclusions |
| `created_at` | TEXT | UTC timestamp of account creation |

#### 2. `diet_plans` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `plan_id` | TEXT (PK) | Unique UUID for the diet plan |
| `user_id` | TEXT (FK) | Reference to owning user (enforces isolation) |
| `breakfast` | TEXT (JSON) | Meal item name, portion, calories, macros |
| `lunch` | TEXT (JSON) | Meal item name, portion, calories, macros |
| `snack` | TEXT (JSON) | Meal item name, portion, calories, macros |
| `dinner` | TEXT (JSON) | Meal item name, portion, calories, macros |
| `nutrition_summary`| TEXT (JSON) | Total calories, protein, carbs, fats, BMR, TDEE |
| `hydration_reminder`| TEXT | Daily water target reminder |
| `dietary_preference`| TEXT | Tag used during generation |
| `goal` | TEXT | Goal applied to calorie adjustments |
| `source` | TEXT | `rule_based_engine` or `ai_api_gemini` |
| `created_at` | TEXT | UTC creation timestamp |

#### 3. `user_files` Table (Object Metadata)
| Column | Type | Description |
| :--- | :--- | :--- |
| `file_id` | TEXT (PK) | Unique file identifier |
| `user_id` | TEXT (FK) | Owner identifier |
| `filename` | TEXT | Original client filename |
| `storage_path` | TEXT | Partitioned key within object storage bucket |
| `file_size` | INTEGER | Size of the object in bytes |
| `content_type` | TEXT | MIME type (e.g. image/jpeg, text/plain) |
| `uploaded_at` | TEXT | UTC upload timestamp |

---

## 🤖 AI Recommendation Engine & Fallback

The AI Engine ensures continuous availability via a two-stage pipeline:

```
[User Request] 
      │
      ▼
Is GEMINI_API_KEY set? ──► YES ──► Send structured JSON prompt to Gemini 1.5 Flash
      │                                       │
      ▼ NO                                    ▼
┌────────────────────────────────┐       Did API respond with valid JSON?
│   Activate Rule-Based Engine   │             │             │
│   - Mifflin-St Jeor BMR        │◄─── NO ─────┘             └─── YES ──► [Return Plan]
│   - Activity Factor TDEE       │                                         (source: "ai_api_gemini")
│   - Goal Deficit / Surplus     │
│   - Macronutrient Balancing    │
│   - Recipe Tag Matching        │
└────────────────────────────────┘
      │
      ▼
[Return Plan] (source: "rule_based_engine")
```

---

## 📡 REST API Documentation

Interactive Swagger documentation is accessible locally at `http://localhost:8000/docs`.

### Authentication
- `POST /api/auth/register` — Register a new account and receive a JWT token.
- `POST /api/auth/login` — Authenticate credentials and receive a JWT token.
- `GET /api/auth/me` — Retrieve profile of the authenticated user.

### Profile Management
- `GET /api/profile` — Fetch current user biometrics.
- `PUT /api/profile` — Update biometric data, diet preference, or health goals.

### AI Diet Plans
- `POST /api/diet/generate-plan` — Trigger the AI recommendation engine with optional overrides.
- `POST /api/diet/plans` — Save a generated diet plan to the cloud database.
- `GET /api/diet/plans` — List all saved diet plans belonging to the authenticated user.
- `GET /api/diet/plans/{id}` — Retrieve single plan details (user isolated).
- `DELETE /api/diet/plans/{id}` — Delete a saved diet plan.
- `GET /api/diet/plans/{id}/export` — Download plan as a formatted Markdown report.

### Cloud Object Storage
- `POST /api/files/upload` — Upload a meal image or health log to object storage.
- `GET /api/files` — List stored files for the authenticated user.
- `GET /api/files/{id}/download` — Stream object binary from cloud storage.
- `DELETE /api/files/{id}` — Remove object from bucket and delete DB record.

### Dashboard
- `GET /api/dashboard` — Aggregated telemetry (targets, latest plan, counts).

---

## 📂 Project Folder Structure

```
AI-Personal-Diet-Planner-Cloud/
│
├── frontend/                     # React Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Navigation and user header
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx     # Login and registration with demo prefill
│   │   │   ├── Dashboard.jsx     # Telemetry and overview
│   │   │   ├── GeneratePlan.jsx  # Meal planning generator form
│   │   │   ├── PlanResult.jsx    # Meal breakdown and save action
│   │   │   ├── SavedPlans.jsx    # Cloud database archive
│   │   │   ├── CloudFiles.jsx    # Cloud object storage manager
│   │   │   └── ProfilePage.jsx   # Biometric profile editor
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service with JWT handling
│   │   ├── App.jsx               # Router & state container
│   │   ├── main.jsx              # DOM entrypoint
│   │   └── index.css             # Responsive styling & utilities
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      # Python FastAPI REST API Microservice
│   ├── app.py                    # Server entrypoint and CORS middleware
│   ├── models/
│   │   └── schemas.py            # Pydantic request/response models
│   ├── services/
│   │   └── auth_service.py       # bcrypt hashing and JWT token handlers
│   └── routes/
│       ├── auth_routes.py        # /api/auth endpoints
│       ├── profile_routes.py     # /api/profile endpoints
│       ├── diet_routes.py        # /api/diet endpoints
│       ├── file_routes.py        # /api/files object storage endpoints
│       └── dashboard_routes.py   # /api/dashboard telemetry endpoint
│
├── ai_engine/                    # Recommendation Module
│   ├── diet_engine.py            # Mifflin-St Jeor engine & Gemini API fallback
│   └── food_data.json            # Curated nutritional food dataset
│
├── cloud/                        # Cloud Infrastructure Abstraction Layer
│   ├── database_service.py       # Dual driver: SQLite (Local) & Firestore (Cloud)
│   └── storage_service.py        # Dual driver: Local Bucket & Firebase Storage
│
├── tests/                        # Automated Pytest Test Suite
│   ├── test_auth.py              # User registration, login, and JWT tests
│   ├── test_diet_engine.py       # BMR/TDEE and nutritional balance tests
│   └── test_user_isolation.py    # Multi-tenant security isolation tests
│
├── docs/                         # Capstone Documentation Deliverables
│   ├── PROJECT_REPORT.md         # 24-section formal university report
│   ├── INTERVIEW_PREP.md         # 10 predicted viva interview Q&As
│   ├── GITHUB_STRATEGY.md        # 12-day Git commit roadmap
│   └── PROOF_CHECKLIST.md        # 23 screenshot portfolio verification list
│
├── .env.example                  # Environment variable configuration template
├── .gitignore                    # Git exclusions
└── README.md                     # Comprehensive project documentation
```

---

## 💻 Local Simulation & Quickstart

Follow these steps to run the complete system locally with zero external dependencies:

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Configure Environment Variables
```powershell
cp .env.example .env
```
*(The default settings are preconfigured for instant local simulation without requiring any cloud keys or credit cards!)*

### 3. Run Backend API Server
```powershell
# Open terminal 1:
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```
API server will start on: `http://localhost:8000`  
Interactive Swagger Docs: `http://localhost:8000/docs`

### 4. Run Frontend Client
```powershell
# Open terminal 2:
cd frontend
npm install
npm run dev
```
Client will launch on: `http://localhost:3000`

---

## 🚀 Cloud Deployment Strategy

### Option 1: Student-Friendly Free-Tier Deployment
- **Frontend**: Deploy `frontend/` to **Vercel** or **Netlify** with build command `npm run build` and output directory `dist`. Set environment variable `VITE_API_URL=https://your-backend.onrender.com`.
- **Backend**: Deploy `backend/` to **Render** or **Railway** as a Python Web Service with start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`.
- **Database & Storage**: Connect Google Cloud Firebase to enable Firestore and Firebase Storage by supplying `FIREBASE_CREDENTIALS_PATH` and setting `DB_BACKEND=firestore` and `STORAGE_BACKEND=firebase`.

### Option 2: Production Enterprise Cloud Architecture (AWS / GCP)
- **Containerization**: Package backend into a Docker container and push to Google Artifact Registry / AWS ECR.
- **Serverless Compute**: Deploy container to **Google Cloud Run** or **AWS ECS Fargate** with autoscaling (0 to 100 instances).
- **Managed Database**: **Google Cloud Firestore** or **Amazon DynamoDB / Aurora Serverless**.
- **Object Storage**: **Amazon S3** or **Google Cloud Storage (GCS)** configured with CORS and IAM least-privilege service accounts.
- **CDN**: **Cloudflare** or **AWS CloudFront** caching static frontend assets at edge locations worldwide.

---

## 🧪 Testing & Verification

Run the full automated test suite using `pytest`:

```powershell
python -m pytest tests/ -v
```

### Verified Test Cases
1. `test_user_registration_and_login_flow`: Validates user account creation, token generation, duplicate email rejection, and invalid password prevention.
2. `test_unauthorized_dashboard_access`: Ensures unauthenticated requests to protected endpoints receive HTTP 401/403.
3. `test_bmr_calculation`: Validates Mifflin-St Jeor formula accuracy.
4. `test_tdee_calculation`: Verifies activity multiplier scaling.
5. `test_nutrition_targets_weight_loss`: Verifies caloric deficit calculations for weight loss goals.
6. `test_vegetarian_diet_plan_generation`: Ensures generated vegetarian plans contain zero meat items.
7. `test_fallback_mechanism_when_api_missing`: Confirms transparent fallback to the rule engine when AI APIs are unconfigured.
8. `test_user_data_isolation_plans_and_files`: Multi-tenant security test proving User A's plans and files are strictly inaccessible to User B.

---

## 🔒 Security & User Isolation

- **Password Hashing**: Industry-standard `bcrypt` algorithm with salt rounds.
- **JWT Cryptography**: Signed with `HS256` containing expiry timestamps and subject claims.
- **User Data Isolation**: Database queries enforce `WHERE user_id = current_user.id` on all endpoints.
- **Storage Partitioning**: Object storage keys are scoped under `/uploads/{user_id}/...`.
- **Input Sanitization**: Pydantic schemas enforce type bounds (e.g. height between 50cm and 250cm, positive calories).

---

## 📈 Scalability & Real-World Evolution

- **10 Users**: Handled easily on a single local instance with SQLite.
- **1,000 Users**: Backend deployed to Google Cloud Run with 2-4 container replicas; SQLite transitioned to managed Cloud Firestore / PostgreSQL.
- **100,000 Users**: Horizontal autoscaling, Redis caching for frequent meal lookups, asynchronous background task queues (Celery/Cloud Tasks) for heavy AI generations, and S3/Cloud Storage pre-signed URLs for direct media streaming.

---

## ⚠️ Academic Disclaimer

> **IMPORTANT NOTICE**: This application is developed strictly for **educational and Cloud Computing course demonstration purposes**. The generated meal schedules, caloric targets, and nutritional summaries represent synthetic, rule-based algorithmic outputs and **do not constitute medical, clinical, or professional dietary advice**. Always consult a qualified medical physician or registered dietitian before making significant changes to your nutritional intake.

---

## 👤 Author
Kishor Kumar L

BE Computer Science & Engineering
Artificial Intelligence & Machine Learning

- **Course**: Cloud Computing & Distributed Systems Capstone
- **Project Title**: AI-Powered Personal Diet Planner with Cloud Storage

⚠️ Disclaimer

This project is developed for educational and academic purposes as a Cloud Computing project.

The generated diet plans and meal suggestions are general wellness examples only and should not be considered medical, clinical, or professional nutritional advice.

The project uses synthetic/demo user data and is not intended to process real clinical or medical records.