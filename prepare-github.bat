@echo off
REM 🚀 GitHub Repository Preparation Script for Windows
REM This script prepares your AI Payroll Dashboard for GitHub deployment

echo 🚀 Preparing AI Payroll Dashboard for GitHub...

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
)

REM Check if .gitignore exists
if not exist ".gitignore" (
    echo ❌ .gitignore not found! Please ensure it exists.
    exit /b 1
)

REM Verify sensitive files are not tracked
echo 🔍 Checking for sensitive files...

REM Check sensitive files
git ls-files --error-unmatch "functions/.runtimeconfig.json" >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ WARNING: functions/.runtimeconfig.json is tracked by git but should be ignored!
    echo    Run: git rm --cached functions/.runtimeconfig.json
) else (
    echo ✅ functions/.runtimeconfig.json properly ignored
)

git ls-files --error-unmatch "firebase-data/" >nul 2>&1
if %errorlevel% equ 0 (
    echo ❌ WARNING: firebase-data/ is tracked by git but should be ignored!
    echo    Run: git rm --cached firebase-data/
) else (
    echo ✅ firebase-data/ properly ignored
)

REM Check if all required files exist
echo 📋 Checking required files...

set "files=README.md DEPLOYMENT.md AI-INSIGHTS-SETUP.md firebase.json firestore.rules package.json public/clean-firebase-dashboard.html public/dashboard.css functions/index.js functions/ai-insights.js functions/enhanced-analytics.js .gitignore"

for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ %%f
    ) else (
        echo ❌ Missing: %%f
    )
)

REM Check package.json
echo 📦 Checking package.json...
if exist "package.json" (
    findstr /C:"YOUR_USERNAME" package.json >nul
    if %errorlevel% equ 0 (
        echo ⚠️  Please update YOUR_USERNAME in package.json
    )
    
    findstr /C:"start" package.json >nul
    if %errorlevel% equ 0 (
        echo ✅ Package.json scripts configured
    ) else (
        echo ❌ Package.json scripts missing
    )
)

REM Check README.md
echo 📖 Checking README.md...
if exist "README.md" (
    findstr /C:"YOUR_USERNAME" README.md >nul
    if %errorlevel% equ 0 (
        echo ⚠️  Please update YOUR_USERNAME in README.md
    )
    
    findstr /C:"Live Demo" README.md >nul
    if %errorlevel% equ 0 (
        echo ✅ README.md has live demo section
    ) else (
        echo ❌ README.md missing live demo section
    )
)

REM Create GitHub repository instructions
echo 📝 GitHub Repository Setup Instructions:
echo 1. Create a new repository on GitHub:
echo    - Name: ai-payroll-dashboard
echo    - Description: AI-powered payroll analytics dashboard with Firebase ^& Gemini AI
echo    - Public repository
echo    - Add topics: firebase, ai, dashboard, analytics, javascript, chartjs

echo.
echo 2. Connect local repository to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/ai-payroll-dashboard.git
echo    git branch -M main
echo    git push -u origin main

echo.
echo 3. Configure GitHub Secrets (for deployment):
echo    - FIREBASE_TOKEN: Your Firebase CI token
echo    - FIREBASE_PROJECT_ID: Your Firebase project ID
echo    - FIREBASE_SERVICE_ACCOUNT: Your service account JSON

echo.
echo 4. Update these files with your GitHub username:
echo    - README.md (replace YOUR_USERNAME)
echo    - package.json (replace YOUR_USERNAME)
echo    - DEPLOYMENT.md (replace YOUR_USERNAME)

echo.
echo 🎉 Your repository is ready for GitHub!
echo 📚 See DEPLOYMENT.md for detailed deployment instructions

pause
