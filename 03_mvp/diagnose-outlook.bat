@echo off
chcp 65001 >nul
title aiCEO - Diagnostic Outlook COM
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File scripts\diagnose-outlook.ps1
echo.
pause
