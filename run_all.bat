@echo off
echo ========================================================
echo   GramVikas (ग्रामविकास) - Launch All Services
echo   Java 17 Backend     : http://localhost:5000
echo   Python Microservice : http://localhost:5001
echo   Web Application     : http://localhost:5173
echo ========================================================

set PATH=%USERPROFILE%\nodejs;%USERPROFILE%\jdk17\bin;%USERPROFILE%\w64devkit\bin;%PATH%
set JAVA_HOME=%USERPROFILE%\jdk17

echo [1/3] Starting Java 17 Backend on port 5000...
start "GramVikas Java Server" /min java -jar "server-java\gramvikas-server.jar" 5000

echo [2/3] Starting Python 3.14 Microservice on port 5001...
start "GramVikas Python Service" /min python "server-python\gramvikas_service.py" 5001

echo [3/3] Opening Web Browser to GramVikas Web App...
start "" "http://localhost:5173"

echo.
echo ========================================================
echo   Starting Vite React Web Application on port 5173...
echo   (Press Ctrl+C to stop the web server)
echo ========================================================
cd client
call npm run dev -- --host 0.0.0.0 --port 5173
