@echo off
title NutriCloud AI - Frontend Client
echo ========================================================
echo   Starting NutriCloud AI Frontend Client
echo   Web Application: http://localhost:3000
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
