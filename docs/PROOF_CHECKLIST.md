# Screenshot & Proof Portfolio Checklist
## AI-Powered Personal Diet Planner with Cloud Storage

A complete checklist of 23 screenshots to capture for your GitHub repository, project report, and portfolio presentations.

---

| # | Recommended Filename | Screen / Component to Capture | What It Proves to Evaluators |
| :-: | :--- | :--- | :--- |
| **1** | `01_project_folder_structure.png` | VS Code Explorer displaying full folder tree (`backend/`, `frontend/`, `ai_engine/`, `cloud/`, `tests/`) | Clean, modular multi-tier enterprise directory architecture. |
| **2** | `02_cloud_architecture_diagram.png` | System architecture diagram (Client, REST API, AI Engine, Cloud DB, Object Storage) | Clear understanding of Cloud Computing multi-tier design. |
| **3** | `03_registration_page.png` | Registration view with biometric fields (Age, Height, Weight, Activity, Diet, Goal) | Comprehensive user profiling and input collection. |
| **4** | `04_successful_registration.png` | Successful account creation and redirect to the dashboard | Working user onboarding flow. |
| **5** | `05_login_page.png` | Login view showing email/password fields and demo prefill button | Secure authentication interface with test convenience. |
| **6** | `06_jwt_token_network.png` | Browser DevTools Network tab showing `POST /api/auth/login` returning Bearer JWT | Stateless token-based cloud security in action. |
| **7** | `07_user_dashboard.png` | Dashboard with welcome greeting, daily calorie target, hydration, and latest plan | Telemetry aggregation across services. |
| **8** | `08_biometric_profile_editor.png` | User profile page showing editable metrics and health goals | Cloud database `PUT /api/profile` update capability. |
| **9** | `09_diet_generator_form.png` | AI Plan Generator form with Vegetarian / Vegan / Non-Veg options and exclusions | Dynamic parameter configuration for the recommendation engine. |
| **10** | `10_diet_plan_result.png` | Generated daily plan with Breakfast, Lunch, Snack, Dinner, and macro badges | Full meal breakdown with calorie and macronutrient computation. |
| **11** | `11_disclaimer_notice.png` | Academic medical disclaimer banner at the bottom of the plan view | Health-tech compliance and ethical computing standards. |
| **12** | `12_plan_saved_toast.png` | "Saved in Cloud Database" confirmation badge | Persistence of structured JSON documents to the cloud database. |
| **13** | `13_saved_plans_archive.png` | Saved Plans page displaying list of archived user plans with timestamps | User-specific historical retrieval from database. |
| **14** | `14_plan_export_markdown.png` | Exported Markdown file opened in editor showing full meal details | Document generation and portability. |
| **15** | `15_object_storage_dashboard.png` | Cloud Object Storage page showing upload drop zone and storage bucket badge | Integration of dedicated Object Storage for binary files. |
| **16** | `16_file_upload_success.png` | Successful upload of a meal photo or health log with size and MIME type | Streaming binary upload and SHA-256 checksum hashing. |
| **17** | `17_file_download_stream.png` | Download/preview of an uploaded object from the storage bucket | Secure object retrieval and content-type streaming. |
| **18** | `18_swagger_api_docs.png` | FastAPI interactive Swagger documentation at `http://localhost:8000/docs` | RESTful API design adherence and OpenAPI compliance. |
| **19** | `19_health_check_endpoint.png` | Browser / Postman view of `GET /health` and `GET /` returning status JSON | Microservice observability and health check monitoring. |
| **20** | `20_pytest_automated_results.png` | Terminal showing `pytest tests/ -v` with all 8 tests passing | Comprehensive unit, integration, and security test validation. |
| **21** | `21_user_isolation_test.png` | Terminal showing `test_user_isolation.py` passing | Proof that User A cannot read or delete User B's cloud data. |
| **22** | `22_cloud_deployment_dashboard.png` | Render / Vercel / Cloud Run service dashboard showing active deployment | Live cloud hosting and continuous deployment. |
| **23** | `23_github_repo_commits.png` | GitHub repository page showing topics, README preview, and commit history | Professional proof of work ready for recruiters. |
