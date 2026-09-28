# Technical Interview Preparation & Viva Voce Guide
## AI-Powered Personal Diet Planner with Cloud Storage

---

### Q1: Can you explain your project?
**Answer**:
"Certainly! My project is an **AI-Powered Personal Diet Planner with Cloud Storage**, built as a full-stack, cloud-computing capstone project. The problem it solves is that people struggle with calculating their daily caloric and macronutrient requirements and maintaining accessible records across multiple devices.

Architecturally, it is designed as a decoupled multi-tier system:
1. A reactive **React 18 Single Page Application** running in the browser.
2. A high-performance **FastAPI REST microservice** backend in Python.
3. A **dual-mode database abstraction** that supports local SQLite for zero-cost testing and Google Cloud Firestore for managed NoSQL production storage.
4. A **cloud object storage layer** that stores binary media like meal photos and health documents in partitioned buckets with SHA-256 checksums, simulating AWS S3 or GCS.
5. An **AI recommendation engine** combining the Google Gemini API with a deterministic Mifflin-St Jeor heuristic fallback engine that guarantees 100% availability even if the AI API is offline or unconfigured.

The system enforces strict multi-tenant user isolation through bcrypt password hashing and signed JWT tokens, and includes automated test coverage with Pytest."

---

### Q2: What is the difference between a Cloud Database and Cloud Object Storage in your project?
**Answer**:
"In my project, they serve fundamentally different architectural roles:
- **Cloud Database (Firestore / SQLite)**: Stores **structured, queryable application data**—such as user accounts, hashed passwords, biometrics, and JSON meal plans. Databases are indexed for fast relational or document lookups (e.g., querying all plans belonging to `user_id = X` in milliseconds).
- **Cloud Object Storage (Firebase Storage / Local Bucket Simulation)**: Stores **unstructured binary blobs**—such as high-resolution meal images and PDF health records. Putting large binaries directly inside a database causes table bloat, slow indexing, and costly backup operations. Instead, we stream the file to object storage, partition it under `/uploads/{user_id}/`, and only store the lightweight metadata and storage URI in the database."

---

### Q3: How did you implement user authentication and prevent User A from accessing User B's data?
**Answer**:
"I used **stateless JWT (JSON Web Token) authentication** combined with `bcrypt` password hashing:
1. When a user registers or logs in, the backend verifies credentials and issues a cryptographically signed `HS256` JWT containing the user's UUID in the subject (`sub`) claim.
2. For all protected endpoints, a FastAPI dependency (`get_current_user`) extracts and validates the Bearer token from the `Authorization` header.
3. For data isolation, the API never trusts client-supplied user IDs in query parameters or URL paths. Instead, all database queries and storage operations strictly filter by the authenticated user's ID (`WHERE user_id = current_user.user_id`). If User B attempts to fetch or delete User A's plan or file, the query returns nothing and the API raises a secure `404 Not Found` response. I validated this with an automated integration test in `test_user_isolation.py`."

---

### Q4: What happens if the external AI API is down, rate-limited, or has no API key configured?
**Answer**:
"I architected the AI layer with an **Automatic Fallback Mechanism**. In `ai_engine/diet_engine.py`, the system first checks if a `GEMINI_API_KEY` is present. If it is, it attempts to query Gemini 1.5 Flash with a timeout and JSON schema constraint.

If the key is missing, or if the API returns a rate-limit (HTTP 429) or error, the engine transparently activates our **local heuristic rule engine**. This engine applies the Mifflin-St Jeor metabolic formula, calculates BMR and TDEE, balances protein, carbohydrates, and fats, and selects matching meals from a curated nutritional dataset (`food_data.json`). The response includes a metadata tag indicating the source (`rule_based_engine` vs `ai_api_gemini`). This ensures the app is completely resilient and never crashes on GitHub or during evaluations."

---

### Q5: How does your system calculate caloric and macronutrient targets?
**Answer**:
"The calculation relies on established nutritional science:
1. **Basal Metabolic Rate (BMR)**: Calculated using the Mifflin-St Jeor equation:
   $$\text{BMR} = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age}) - 78$$
2. **Total Daily Energy Expenditure (TDEE)**: Scaled by activity multiplier: Sedentary (1.2), Moderate (1.55), Active (1.725).
3. **Goal Adjustment**:
   - Weight Loss: Deficit of $-500\text{ kcal/day}$
   - Weight Gain / Hypertrophy: Surplus of $+400\text{ kcal/day}$
   - Maintenance: $+0\text{ kcal/day}$
4. **Macronutrient Split**: Target calories are distributed into $25\%$ Protein ($4\text{ kcal/g}$), $50\%$ Carbohydrates ($4\text{ kcal/g}$), and $25\%$ Healthy Fats ($9\text{ kcal/g}$).
5. **Hydration**: Calculated dynamically as $\text{weight (kg)} \times 0.035$ liters."

---

### Q6: How does your project demonstrate Cloud Computing models (SaaS, PaaS, IaaS)?
**Answer**:
"The project touches all three cloud service models:
- **SaaS (Software as a Service)**: From the end-user perspective, the diet planner is a turnkey SaaS product accessible via any web browser without local configuration.
- **PaaS (Platform as a Service)**: As developers, we deploy the backend and frontend to managed PaaS providers (e.g., Render, Google Cloud Run, Vercel) where the underlying OS, runtime, and server scaling are managed for us.
- **IaaS (Infrastructure as a Service)**: If deploying on AWS or Google Cloud, the containers run on virtual compute nodes, virtual private clouds (VPCs), and block storage volumes provided as IaaS by the cloud vendor."

---

### Q7: How would you scale this application from 10 users to 100,000 users?
**Answer**:
"Scaling follows a three-stage roadmap:
1. **Application Layer**: Because the FastAPI backend is completely stateless (state is encapsulated in JWTs), we can deploy it behind a Cloud Load Balancer (or Google Cloud Run) and scale horizontally across dozens of container instances based on CPU utilization and request concurrency.
2. **Database Layer**: Transition from local SQLite to managed Cloud Firestore or Amazon Aurora Serverless with read replicas, connection pooling, and automatic sharding.
3. **Caching Layer**: Introduce a Redis cache to store common food dataset items and frequently generated meal combinations to reduce database and AI engine latency.
4. **Object Storage**: For 100,000 users, we would switch from proxying uploads through the backend server to generating **Pre-Signed URLs** (S3/GCS), allowing the client to upload binary media directly to the cloud bucket, bypassing backend memory."

---

### Q8: Why did you choose FastAPI over Flask or Django for the cloud backend?
**Answer**:
"I selected FastAPI for three specific reasons:
1. **Asynchronous Throughput**: FastAPI is built on Starlette and ASGI, giving it asynchronous I/O performance comparable to Node.js and Go.
2. **Pydantic Data Validation**: Automatic type validation, schema enforcement, and JSON serialization eliminate manual parsing and prevent injection vulnerabilities.
3. **Automated OpenAPI / Swagger Documentation**: FastAPI natively generates interactive API documentation at `/docs`, which is essential for cloud microservices and course evaluations."

---

### Q9: How are sensitive secrets and credentials managed in the cloud deployment?
**Answer**:
"We adhere strictly to Twelve-Factor App methodology:
- No passwords, JWT secret keys, or cloud credentials are hardcoded into the source code.
- A template `.env.example` is committed to version control, while `.env` and `firebase-credentials.json` are excluded via `.gitignore`.
- In a production cloud environment, secrets are injected as secure environment variables using cloud secret managers like **Google Cloud Secret Manager** or **AWS Secrets Manager**."

---

### Q10: What is your project's legal / medical disclaimer policy?
**Answer**:
"As an engineering capstone, the project strictly positions itself as an **educational and general wellness demonstration**. Every generated plan payload and user interface view explicitly displays a disclaimer stating that the recommendations are algorithmic simulations and do not constitute clinical or medical nutrition advice. This reflects industry best practices for health-tech compliance."
