@echo off
chcp 65001 >nul
title aiCEO - Import Outlook 30j
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo.
echo ============================================================
echo   aiCEO - Import Outlook (30 derniers jours)
echo ============================================================
echo.

REM --- 1. Verification Node ---
where node >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] Node.js introuvable. Installez-le depuis https://nodejs.org/
    pause
    exit /b 1
)

REM --- 2. Refresh seed ---
echo [1/4] Rafraichissement du seed depuis ..\assets\data.js
node scripts\extract-data.js
if errorlevel 1 (
    echo [ERREUR] extract-data.js a echoue.
    pause
    exit /b 1
)
echo.

REM --- 3. Extraction Outlook COM ---
echo [2/4] Extraction Outlook via COM (Outlook doit etre ouvert)
echo       Si une popup de securite apparait, choisir "Autoriser 10 min".
echo.
powershell -ExecutionPolicy Bypass -File scripts\fetch-outlook.ps1
if errorlevel 1 (
    echo.
    echo [ERREUR] fetch-outlook.ps1 a echoue.
    echo   - Outlook est-il bien lance ?
    echo   - Avez-vous cliquer "Autoriser" sur la popup de securite ?
    echo   - Relancez ce .bat apres avoir resolu.
    pause
    exit /b 1
)
echo.

REM --- 4. Normalisation ---
echo [3/4] Filtrage bruit + inference projet
node scripts\normalize-emails.js
if errorlevel 1 (
    echo [ERREUR] normalize-emails.js a echoue.
    pause
    exit /b 1
)
echo.

REM --- 5. Digest ---
echo [4/4] Digest
node scripts\print-summary.js

echo.
echo ============================================================
echo   Prochaine etape : double-clic sur start.bat
echo   puis "Lancer l'arbitrage" sur http://localhost:4747
echo ============================================================
echo.
pause
