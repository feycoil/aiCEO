@echo off
chcp 65001 >nul
title aiCEO MVP - arbitrage matinal

echo.
echo ========================================
echo   aiCEO MVP - arbitrage matinal
echo ========================================
echo.

REM Verifie que Node.js est installe
where node >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe.
    echo.
    echo Installez Node.js 18+ depuis : https://nodejs.org/
    echo Choisissez la version LTS. Relancez ce fichier apres installation.
    echo.
    pause
    exit /b 1
)

echo [OK] Node detecte :
node --version
echo.

REM Se place dans le dossier du script
cd /d "%~dp0"

REM Installe les dependances si necessaire
if not exist "node_modules" (
    echo [INFO] Premiere execution - installation des dependances...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERREUR] npm install a echoue.
        pause
        exit /b 1
    )
    echo.
)

REM Genere le seed.json a partir du data.js
if not exist "data\seed.json" (
    echo [INFO] Extraction des donnees depuis ..\assets\data.js ...
    call npm run seed
    echo.
)

REM Lance le navigateur dans 3 secondes puis demarre le serveur
echo [INFO] Ouverture du navigateur dans 3 secondes...
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:4747"

echo.
echo ========================================
echo   Serveur en cours de demarrage...
echo   Fermer cette fenetre pour arreter.
echo ========================================
echo.

node server.js

pause
