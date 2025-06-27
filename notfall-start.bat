@echo off
:: NOTFALL-STARTER - Minimale Version
echo 🎯 Triangulation App - Notfall-Start
echo.

:: Backend starten
echo Backend startet...
cd backend
start /b python app.py
timeout /t 2 /nobreak >nul

:: Frontend starten  
echo Frontend startet...
cd ..\frontend
start npm start

echo.
echo App gestartet!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
pause
