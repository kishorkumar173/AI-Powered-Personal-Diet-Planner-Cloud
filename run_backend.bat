@echo off
title NutriCloud AI - Backend Server
echo ========================================================
echo   Starting NutriCloud AI Backend REST API Server
echo   API Endpoint: http://localhost:8000
echo   Swagger Docs: http://localhost:8000/docs
echo ========================================================
cd /d "%~dp0"
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
pause
