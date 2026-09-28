"""
Main Application Entrypoint - AI-Powered Personal Diet Planner with Cloud Storage
FastAPI REST API Server
"""

import os
import sys
from pathlib import Path

# Add project root directory to sys.path so modules resolve from any folder
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routes.auth_routes import router as auth_router
from backend.routes.profile_routes import router as profile_router
from backend.routes.diet_routes import router as diet_router
from backend.routes.file_routes import router as file_router
from backend.routes.dashboard_routes import router as dashboard_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("diet_planner_api")

app = FastAPI(
    title="AI-Powered Personal Diet Planner with Cloud Storage API",
    description="Industry-grade Cloud Computing Course Project REST API. Demonstrates Cloud Authentication, Cloud Database (SQLite/Firestore), Cloud Object Storage (Local/Firebase), and AI-Assisted Meal Planning with Rule-Based Fallback.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Configuration (Permits Frontend SPA integration from any origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?:\/\/.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(diet_router)
app.include_router(file_router)
app.include_router(dashboard_router)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )


@app.get("/", tags=["Health"])
def root_endpoint():
    return {
        "status": "online",
        "service": "AI-Powered Personal Diet Planner API",
        "cloud_database": os.getenv("DB_BACKEND", "sqlite"),
        "cloud_storage": os.getenv("STORAGE_BACKEND", "local"),
        "ai_engine_status": "active (rule-based fallback ready)",
        "docs_url": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": os.environ.get("SERVER_START_TIME", "live"),
        "uptime": "nominal"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting server on http://{host}:{port}")
    # Auto-detect whether running from inside 'backend' folder or from project root
    app_target = "app:app" if Path.cwd().name == "backend" else "backend.app:app"
    uvicorn.run(app_target, host=host, port=port, reload=True)
