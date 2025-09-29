#!/bin/bash

# 🚀 GitHub Repository Preparation Script
# This script prepares your AI Payroll Dashboard for GitHub deployment

echo "🚀 Preparing AI Payroll Dashboard for GitHub..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo -e "${RED}❌ .gitignore not found! Please ensure it exists.${NC}"
    exit 1
fi

# Verify sensitive files are not tracked
echo -e "${BLUE}🔍 Checking for sensitive files...${NC}"

SENSITIVE_FILES=(
    "functions/.runtimeconfig.json"
    "firebase-data/"
    "firebase-debug.log"
    "firestore-debug.log"
    "node_modules/"
    ".env"
    ".env.local"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        echo -e "${RED}❌ WARNING: $file is tracked by git but should be ignored!${NC}"
        echo -e "${YELLOW}   Run: git rm --cached $file${NC}"
    else
        echo -e "${GREEN}✅ $file properly ignored${NC}"
    fi
done

# Check if all required files exist
echo -e "${BLUE}📋 Checking required files...${NC}"

REQUIRED_FILES=(
    "README.md"
    "DEPLOYMENT.md"
    "AI-INSIGHTS-SETUP.md"
    "firebase.json"
    "firestore.rules"
    "package.json"
    "public/clean-firebase-dashboard.html"
    "public/dashboard.css"
    "functions/index.js"
    "functions/ai-insights.js"
    "functions/enhanced-analytics.js"
    ".gitignore"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

# Check package.json
echo -e "${BLUE}📦 Checking package.json...${NC}"
if [ -f "package.json" ]; then
    # Check if name is updated
    if grep -q "YOUR_USERNAME" package.json; then
        echo -e "${YELLOW}⚠️  Please update YOUR_USERNAME in package.json${NC}"
    fi
    
    # Check if scripts are present
    if grep -q '"start"' package.json; then
        echo -e "${GREEN}✅ Package.json scripts configured${NC}"
    else
        echo -e "${RED}❌ Package.json scripts missing${NC}"
    fi
fi

# Check README.md
echo -e "${BLUE}📖 Checking README.md...${NC}"
if [ -f "README.md" ]; then
    if grep -q "YOUR_USERNAME" README.md; then
        echo -e "${YELLOW}⚠️  Please update YOUR_USERNAME in README.md${NC}"
    fi
    
    if grep -q "Live Demo" README.md; then
        echo -e "${GREEN}✅ README.md has live demo section${NC}"
    else
        echo -e "${RED}❌ README.md missing live demo section${NC}"
    fi
fi

# Create GitHub repository instructions
echo -e "${BLUE}📝 GitHub Repository Setup Instructions:${NC}"
echo -e "${YELLOW}1. Create a new repository on GitHub:${NC}"
echo -e "   - Name: ai-payroll-dashboard"
echo -e "   - Description: AI-powered payroll analytics dashboard with Firebase & Gemini AI"
echo -e "   - Public repository"
echo -e "   - Add topics: firebase, ai, dashboard, analytics, javascript, chartjs"

echo -e "${YELLOW}2. Connect local repository to GitHub:${NC}"
echo -e "   git remote add origin https://github.com/YOUR_USERNAME/ai-payroll-dashboard.git"
echo -e "   git branch -M main"
echo -e "   git push -u origin main"

echo -e "${YELLOW}3. Configure GitHub Secrets (for deployment):${NC}"
echo -e "   - FIREBASE_TOKEN: Your Firebase CI token"
echo -e "   - FIREBASE_PROJECT_ID: Your Firebase project ID"
echo -e "   - FIREBASE_SERVICE_ACCOUNT: Your service account JSON"

echo -e "${YELLOW}4. Update these files with your GitHub username:${NC}"
echo -e "   - README.md (replace YOUR_USERNAME)"
echo -e "   - package.json (replace YOUR_USERNAME)"
echo -e "   - DEPLOYMENT.md (replace YOUR_USERNAME)"

echo -e "${GREEN}🎉 Your repository is ready for GitHub!${NC}"
echo -e "${BLUE}📚 See DEPLOYMENT.md for detailed deployment instructions${NC}"
