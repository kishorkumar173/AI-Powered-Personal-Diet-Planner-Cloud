# Academic Project Report: AI-Powered Personal Diet Planner with Cloud Storage

**Course**: Cloud Computing & Distributed Systems  
**Domain**: Cloud Application Development, AI Integration, and Object Storage  
**Project Title**: AI-Powered Personal Diet Planner with Cloud Storage  

---

## 1. Abstract
The "AI-Powered Personal Diet Planner with Cloud Storage" is a multi-tier, cloud-native web application designed to compute personalized nutritional meal plans, record daily biometric goals, and manage unstructured health assets across devices. Built upon a decoupled client-server architecture, the system employs a modern single-page React frontend, a high-throughput Python FastAPI REST microservice, a dual-driver cloud database (SQLite for local emulation and Google Cloud Firestore for managed cloud persistence), and an object storage layer simulating Amazon S3 / Google Cloud Storage buckets. An AI recommendation engine integrates generative AI APIs (Google Gemini) alongside a deterministic Mifflin-St Jeor heuristic fallback engine. Strict multi-tenant data isolation is guaranteed via bcrypt password hashing and JSON Web Token (JWT) cryptographic authorization.

---

## 2. Introduction
Modern health and wellness tracking requires ubiquitous access, continuous availability, and responsive data synchronization. Traditional desktop applications or local mobile storage solutions suffer from fragmentation, single-point-of-failure vulnerabilities, and an inability to scale. Cloud computing offers elastic compute, centralized databases, and highly durable object storage, enabling seamless multi-device access and automated recommendation services.

---

## 3. Problem Statement
Individuals striving to maintain a balanced lifestyle face recurring hurdles:
1. **Complex Metabolic Calculations**: Determining Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) manually is error-prone.
2. **Nutritional Imbalance**: Planning meals that fulfill strict macronutrient splits (protein, carbohydrates, fats) while respecting dietary preferences (Vegetarian, Vegan, Non-Vegetarian) is time-consuming.
3. **Storage Fragmentation**: Users lack a secure, unified cloud repository to archive meal photos, diet logs, and nutritional histories with anywhere access.

---

## 4. Project Objectives
1. Implement a cloud-hosted client-server architecture adhering to RESTful API principles.
2. Provide secure user authentication and authorization using bcrypt and signed JWT tokens.
3. Deploy a centralized cloud database for structured biometric and diet plan records.
4. Integrate a cloud object storage service for unstructured binary files (meal images, documents).
5. Develop an AI recommendation engine equipped with a zero-failure local heuristic fallback mechanism.
6. Verify multi-tenant security to ensure absolute user data isolation.
7. Deliver a zero-cost local simulation environment alongside production cloud deployment paths.

---

## 5. Existing System vs. Proposed System

| Feature | Existing System (Traditional Local App) | Proposed System (Cloud-Native Diet Planner) |
| :--- | :--- | :--- |
| **Architecture** | Monolithic, tied to a single local device | Decoupled Client-Server REST Microservice |
| **Data Storage** | Local hard drive or local SQLite only | Centralized Cloud Database with multi-device sync |
| **Object Storage** | Local directory path (vulnerable to data loss) | Partitioned Cloud Object Storage with checksums |
| **Recommendation** | Static hardcoded lists or unverified blogs | AI-driven generation with heuristic fallback |
| **Security** | Plaintext or device-dependent credentials | Cryptographic bcrypt hashing & JWT token guards |
| **Availability** | Accessible only on the physical host machine | 99.99% cloud availability across web browsers |

---

## 6. Cloud Computing Concepts Demonstrated
1. **SaaS (Software as a Service)**: End-users consume diet planning and tracking directly in a web browser without installing dependencies.
2. **PaaS (Platform as a Service)**: The backend API runs inside managed application platforms (Render, Google Cloud Run).
3. **IaaS (Infrastructure as a Service)**: Virtual compute, networks, and disks backing the managed cloud platform.
4. **Cloud Database**: Managed NoSQL / relational stores guaranteeing low-latency ACID or BASE data access.
5. **Cloud Object Storage**: Partitioned buckets storing arbitrary binaries with metadata, MIME types, and streaming retrieval.
6. **Stateless REST Architecture**: The server maintains no in-memory session state; every request contains cryptographic claims in headers.
7. **Secrets Management**: Credentials and API keys are strictly kept out of version control and injected via environment variables.

---

## 7. Technology Stack
- **Client Layer**: React 18, Vite, Lucide Icons, Modern CSS3 variables.
- **Application Layer**: Python 3.10+, FastAPI ASGI framework, Pydantic V2, Uvicorn.
- **Security**: `passlib[bcrypt]`, `python-jose` (HS256 JWT tokens).
- **Database Abstraction**: `BaseDatabaseService` interface with `SQLiteDatabaseService` and `FirestoreDatabaseService` implementations.
- **Storage Abstraction**: `BaseStorageService` interface with `LocalStorageService` (simulated S3 bucket) and `FirebaseCloudStorageService`.
- **AI Recommendation Engine**: Google Gemini API client with heuristic Mifflin-St Jeor nutritional engine fallback.
- **Testing**: `pytest`, `fastapi.testclient`.

---

## 8. System Architecture & Component Design
The system is divided into five modular layers:
1. **Client Layer**: Single-page application rendering Dashboard, AI Plan Generator, Result Details, Saved Plans, and Cloud Storage Browser.
2. **API Gateway & Routing Layer**: FastAPI server configuring CORS, routing HTTP endpoints, and enforcing route-level Bearer authentication.
3. **AI Recommendation Layer**: Hybrid module querying generative AI models with automatic transition to the local rule engine if offline.
4. **Database Persistence Layer**: Handles structured CRUD operations on users, diet plans, and file metadata.
5. **Object Storage Layer**: Streams binary files into partitioned bucket directories, generates unique hash identifiers, and provides secure download streams.

---

## 9. Database Design & Schemas
- **`users` Table**: `user_id` (PK), `name`, `email` (Unique), `hashed_password`, `age`, `height`, `weight`, `activity_level`, `dietary_preference`, `goal`, `allergies`, `created_at`.
- **`diet_plans` Table**: `plan_id` (PK), `user_id` (FK), `breakfast` (JSON), `lunch` (JSON), `snack` (JSON), `dinner` (JSON), `nutrition_summary` (JSON), `hydration_reminder`, `dietary_preference`, `goal`, `source`, `created_at`.
- **`user_files` Table**: `file_id` (PK), `user_id` (FK), `filename`, `storage_path`, `file_size`, `content_type`, `uploaded_at`.

---

## 10. AI Recommendation & Fallback Logic
1. **BMR Formula (Mifflin-St Jeor)**:
   $$\text{BMR} = 10 \times \text{weight (kg)} + 6.25 \times \text{height (cm)} - 5 \times \text{age} - 78$$
2. **TDEE Calculation**:
   $$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
   (Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725, Very Active: 1.9)
3. **Goal Adjustments**:
   - Weight Loss: $\text{TDEE} - 500\text{ kcal}$
   - Weight Gain: $\text{TDEE} + 400\text{ kcal}$
   - Maintenance: $\text{TDEE} + 0\text{ kcal}$
4. **Macronutrient Balance**:
   - Protein: $25\%$ of calories ($4\text{ kcal/g}$)
   - Carbohydrates: $50\%$ of calories ($4\text{ kcal/g}$)
   - Healthy Fats: $25\%$ of calories ($9\text{ kcal/g}$)
5. **Hydration Calculation**:
   $$\text{Water (Liters)} = \text{weight (kg)} \times 0.035$$
6. **Fallback Mechanism**:
   If an AI API key is not configured or an API call times out, the local rule engine immediately constructs a balanced four-meal schedule matching the user's dietary tag (vegetarian, vegan, non-vegetarian) and exclusion criteria, ensuring 100% application uptime.

---

## 11. Security Implementation & Multi-Tenant Isolation
- **Password Security**: Passwords are salted and hashed using `bcrypt`. Plaintext passwords are never saved.
- **JWT Authentication**: Users receive signed tokens valid for 24 hours. The `get_current_user` FastAPI dependency decodes the token and extracts the subject (`user_id`).
- **Data Isolation**: All database queries enforce `WHERE user_id = :current_user_id`. Attempting to access another user's `plan_id` or `file_id` returns an HTTP 404 (Not Found).
- **CORS Protection**: Access is bounded by origin policies.

---

## 12. Testing & Verification Results
The test suite (`pytest tests/ -v`) executes 8 automated unit and integration tests:
1. `test_user_registration_and_login_flow`: **PASSED** (Registers user, receives token, rejects duplicate email, rejects invalid password).
2. `test_unauthorized_dashboard_access`: **PASSED** (Rejects requests lacking valid Authorization headers).
3. `test_bmr_calculation`: **PASSED** (Mifflin-St Jeor math verified).
4. `test_tdee_calculation`: **PASSED** (Activity scaling verified).
5. `test_nutrition_targets_weight_loss`: **PASSED** (Deficit verified).
6. `test_vegetarian_diet_plan_generation`: **PASSED** (Vegetarian filter verified with zero meat ingredients).
7. `test_fallback_mechanism_when_api_missing`: **PASSED** (Fallback activates cleanly without exceptions).
8. `test_user_data_isolation_plans_and_files`: **PASSED** (User A's plans and files are completely invisible and inaccessible to User B).

---

## 13. Scalability Analysis
- **10 Concurrent Users**: Handled by single ASGI worker and local SQLite/disk storage.
- **1,000 Concurrent Users**: Scaled horizontally across multiple container replicas on Google Cloud Run or AWS ECS behind an Application Load Balancer. SQLite transitioned to managed Cloud Firestore.
- **100,000 Concurrent Users**: Distributed across auto-scaling serverless containers, Redis caching for common food items and macro lookups, and direct client uploads to S3/GCS using Pre-Signed URLs.

---

## 14. Academic & Health Disclaimer
This project is an academic simulation built to demonstrate cloud computing paradigms, multi-tier architectures, and API integrations. The generated recommendations do not substitute for clinical dietary advice or medical diagnosis.

---

## 15. Conclusion
The "AI-Powered Personal Diet Planner with Cloud Storage" successfully demonstrates the implementation of core Cloud Computing concepts in a practical, real-world context. By providing dual-driver database and storage abstraction, an intelligent AI fallback mechanism, and multi-tenant security verification, the project stands as a complete, industry-ready software engineering capstone.
