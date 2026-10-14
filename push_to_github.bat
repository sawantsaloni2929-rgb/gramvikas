@echo off
echo ========================================================
echo   GramVikas - Push to GitHub (sawantsaloni2929-rgb)
echo ========================================================

set PATH=%USERPROFILE%\mingit\cmd;%USERPROFILE%\mingit\mingw64\bin;%PATH%

echo Checking remote configuration...
git remote -v

echo.
echo Pushing branch 'main' to https://github.com/sawantsaloni2929-rgb/gramvikas.git ...
echo (If prompted, sign in via browser or enter your GitHub credentials)
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Code pushed to:
    echo   https://github.com/sawantsaloni2929-rgb/gramvikas
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   NOTE: Please ensure you created the empty repository:
    echo   'gramvikas' at https://github.com/new
    echo ========================================================
)
pause
