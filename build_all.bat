@echo off
echo ========================================================
echo   GramVikas - Complete Build Script
echo   Polyglot Stack: Java 17, C++ 17, C 11, Python, TypeScript
echo ========================================================

set PATH=%USERPROFILE%\nodejs;%USERPROFILE%\jdk17\bin;%USERPROFILE%\w64devkit\bin;%PATH%
set JAVA_HOME=%USERPROFILE%\jdk17

echo.
echo [1/5] Compiling Java 17 Backend REST ^& Sync Server...
if not exist "server-java\build" mkdir "server-java\build"
javac -encoding UTF-8 -d "server-java\build" "server-java\src\main\java\com\gramvikas\DataStore.java" "server-java\src\main\java\com\gramvikas\GramVikasServer.java"
if %ERRORLEVEL% neq 0 (
    echo Java compilation failed!
    exit /b %ERRORLEVEL%
)
jar -cfe "server-java\gramvikas-server.jar" com.gramvikas.GramVikasServer -C "server-java\build" .
echo Java 17 Server JAR built successfully: server-java\gramvikas-server.jar

echo.
echo [2/5] Compiling Native C++ Business Intelligence Engine...
g++ -O2 -std=c++17 -o "engine-cpp\GramVikasBI.exe" "engine-cpp\GramVikasBI.cpp"
if %ERRORLEVEL% neq 0 (
    echo C++ compilation failed!
    exit /b %ERRORLEVEL%
)
echo Native C++ Engine built: engine-cpp\GramVikasBI.exe

echo.
echo [3/5] Compiling Native C Synchronization ^& Conflict Resolver...
gcc -O2 -o "native-c\SyncConflictResolver.exe" "native-c\SyncConflictResolver.c"
if %ERRORLEVEL% neq 0 (
    echo C compilation failed!
    exit /b %ERRORLEVEL%
)
echo Native C Engine built: native-c\SyncConflictResolver.exe

echo.
echo [4/5] Testing Python Agro-BI ^& Smart SMS Dispatcher...
python "server-python\gramvikas_service.py" --demo
if %ERRORLEVEL% neq 0 (
    echo Python execution failed!
    exit /b %ERRORLEVEL%
)
echo Python Microservice verified cleanly: server-python\gramvikas_service.py

echo.
echo [5/5] Building Client PWA (React + TypeScript + Vite + Tailwind CSS)...
cd client
call npm run build
cd ..
if %ERRORLEVEL% neq 0 (
    echo Client build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   BUILD SUCCESSFUL! All 5 polyglot modules compiled.
echo   To launch the servers, run: run_all.bat
echo ========================================================
