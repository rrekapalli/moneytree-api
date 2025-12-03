#!/bin/bash

# Verification script for Portfolio Details/Config Split feature
# This script checks if the environment is ready for manual testing

echo "========================================="
echo "Portfolio Details/Config Split"
echo "Setup Verification Script"
echo "========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_CHECKS_PASSED=true

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ALL_CHECKS_PASSED=false
    fi
}

# Check 1: Node.js installed
echo "Checking prerequisites..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js installed ($NODE_VERSION)"
else
    print_status 1 "Node.js not found"
fi

# Check 2: npm installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm installed ($NPM_VERSION)"
else
    print_status 1 "npm not found"
fi

# Check 3: Java installed
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    print_status 0 "Java installed ($JAVA_VERSION)"
else
    print_status 1 "Java not found"
fi

echo ""
echo "Checking project structure..."

# Check 4: Frontend directory exists
if [ -d "frontend" ]; then
    print_status 0 "Frontend directory exists"
else
    print_status 1 "Frontend directory not found"
fi

# Check 5: Backend directory exists
if [ -d "backend" ]; then
    print_status 0 "Backend directory exists"
else
    print_status 1 "Backend directory not found"
fi

# Check 6: Frontend node_modules exists
if [ -d "frontend/node_modules" ]; then
    print_status 0 "Frontend dependencies installed"
else
    print_status 1 "Frontend dependencies not installed (run: cd frontend && npm install)"
fi

echo ""
echo "Checking component files..."

# Check 7: PortfolioDetailsComponent exists
if [ -f "frontend/src/app/features/portfolios/details/details.component.ts" ]; then
    print_status 0 "PortfolioDetailsComponent exists"
else
    print_status 1 "PortfolioDetailsComponent not found"
fi

# Check 8: PortfolioConfigureComponent exists
if [ -f "frontend/src/app/features/portfolios/configure/configure.component.ts" ]; then
    print_status 0 "PortfolioConfigureComponent exists"
else
    print_status 1 "PortfolioConfigureComponent not found"
fi

# Check 9: PortfolioConfigApiService exists
if [ -f "frontend/src/app/services/apis/portfolio-config.api.ts" ]; then
    print_status 0 "PortfolioConfigApiService exists"
else
    print_status 1 "PortfolioConfigApiService not found"
fi

echo ""
echo "Checking testing documentation..."

# Check 10: Manual testing guide exists
if [ -f ".kiro/specs/portfolio-details-config-split/MANUAL_TESTING_GUIDE.md" ]; then
    print_status 0 "Manual testing guide exists"
else
    print_status 1 "Manual testing guide not found"
fi

# Check 11: Quick start guide exists
if [ -f ".kiro/specs/portfolio-details-config-split/QUICK_START_TESTING.md" ]; then
    print_status 0 "Quick start guide exists"
else
    print_status 1 "Quick start guide not found"
fi

echo ""
echo "Checking if services are running..."

# Check 12: Backend running
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    print_status 0 "Backend is running (port 8080)"
else
    print_status 1 "Backend is not running (start with: cd backend && ./start-app.sh)"
fi

# Check 13: Frontend running
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    print_status 0 "Frontend is running (port 4200)"
else
    print_status 1 "Frontend is not running (start with: cd frontend && npm start)"
fi

echo ""
echo "========================================="

if [ "$ALL_CHECKS_PASSED" = true ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo ""
    echo "You are ready to start manual testing."
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:4200 in your browser"
    echo "2. Open browser DevTools (F12)"
    echo "3. Follow QUICK_START_TESTING.md for quick tests"
    echo "4. Follow MANUAL_TESTING_GUIDE.md for comprehensive tests"
    exit 0
else
    echo -e "${RED}Some checks failed!${NC}"
    echo ""
    echo "Please fix the issues above before starting manual testing."
    echo ""
    echo "Common fixes:"
    echo "- Install Node.js: https://nodejs.org/"
    echo "- Install dependencies: cd frontend && npm install"
    echo "- Start both services: ./start-all.sh"
    echo "  OR"
    echo "- Start backend: cd backend && ./start-app.sh"
    echo "- Start frontend: cd frontend && npm start"
    exit 1
fi
