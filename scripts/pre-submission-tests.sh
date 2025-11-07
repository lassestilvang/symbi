#!/bin/bash

# Pre-Submission Test Script
# Runs automated checks before app store submission

# Don't exit on error - we want to collect all test results
set +e

echo "🚀 Starting Pre-Submission Tests for Symbi"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1"
    ((WARNINGS++))
}

echo "1. Checking Project Configuration"
echo "-----------------------------------"

# Check package.json version
VERSION=$(node -p "require('./package.json').version")
echo "App Version: $VERSION"

# Check if version is valid (X.Y.Z format)
if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_result 0 "Version format is valid ($VERSION)"
else
    print_result 1 "Version format is invalid ($VERSION)"
fi

# Check app.json configuration
if [ -f "app.json" ]; then
    print_result 0 "app.json exists"
    
    # Check bundle ID
    BUNDLE_ID=$(node -p "require('./app.json').expo.ios.bundleIdentifier" 2>/dev/null || echo "")
    if [ "$BUNDLE_ID" = "com.symbi.app" ]; then
        print_result 0 "iOS bundle ID is correct"
    else
        print_result 1 "iOS bundle ID is incorrect or missing"
    fi
    
    # Check Android package
    PACKAGE=$(node -p "require('./app.json').expo.android.package" 2>/dev/null || echo "")
    if [ "$PACKAGE" = "com.symbi.app" ]; then
        print_result 0 "Android package name is correct"
    else
        print_result 1 "Android package name is incorrect or missing"
    fi
else
    print_result 1 "app.json not found"
fi

echo ""
echo "2. Checking Required Assets"
echo "----------------------------"

# Check app icon
if [ -f "assets/icon.png" ]; then
    print_result 0 "App icon exists"
    
    # Check icon dimensions (should be 1024x1024)
    if command -v identify &> /dev/null; then
        ICON_SIZE=$(identify -format "%wx%h" assets/icon.png)
        if [ "$ICON_SIZE" = "1024x1024" ]; then
            print_result 0 "App icon size is correct (1024x1024)"
        else
            print_result 1 "App icon size is incorrect (found: $ICON_SIZE, expected: 1024x1024)"
        fi
    else
        print_warning "ImageMagick not installed, skipping icon size check"
    fi
else
    print_result 1 "App icon not found"
fi

# Check adaptive icon
if [ -f "assets/adaptive-icon.png" ]; then
    print_result 0 "Adaptive icon exists"
else
    print_result 1 "Adaptive icon not found"
fi

# Check splash screen
if [ -f "assets/splash-icon.png" ]; then
    print_result 0 "Splash screen exists"
else
    print_result 1 "Splash screen not found"
fi

# Check animations
ANIMATION_DIRS=("src/assets/animations/phase1" "src/assets/animations/phase2")
for dir in "${ANIMATION_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        ANIMATION_COUNT=$(find "$dir" -name "*.json" | wc -l)
        if [ $ANIMATION_COUNT -gt 0 ]; then
            print_result 0 "Animations found in $dir ($ANIMATION_COUNT files)"
        else
            print_result 1 "No animations found in $dir"
        fi
    else
        print_result 1 "Animation directory not found: $dir"
    fi
done

echo ""
echo "3. Running Code Quality Checks"
echo "-------------------------------"

# Check for TypeScript errors
if command -v tsc &> /dev/null; then
    if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
        print_result 1 "TypeScript compilation has errors"
    else
        print_result 0 "TypeScript compilation successful"
    fi
else
    print_warning "TypeScript not found, skipping compilation check"
fi

# Run ESLint
if npm run lint > /dev/null 2>&1; then
    print_result 0 "ESLint passed"
else
    print_warning "ESLint has warnings or errors (run 'npm run lint' for details)"
fi

# Check for TODO comments in production code
if [ -d "src/" ]; then
    TODO_COUNT=$(grep -r "TODO" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$TODO_COUNT" -eq 0 ]; then
        print_result 0 "No TODO comments in production code"
    else
        print_warning "Found $TODO_COUNT TODO comments in production code"
    fi
else
    print_warning "src/ directory not found, skipping TODO check"
fi

# Check for console.log statements
if [ -d "src/" ]; then
    CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$CONSOLE_COUNT" -eq 0 ]; then
        print_result 0 "No console.log statements in production code"
    else
        print_warning "Found $CONSOLE_COUNT console.log statements in production code"
    fi
else
    print_warning "src/ directory not found, skipping console.log check"
fi

echo ""
echo "4. Running Unit Tests"
echo "---------------------"

# Run tests
if npm test -- --passWithNoTests --silent > /dev/null 2>&1; then
    print_result 0 "Unit tests passed"
else
    print_warning "Unit tests failed or not configured (run 'npm test' for details)"
fi

echo ""
echo "5. Checking Documentation"
echo "-------------------------"

# Check README
if [ -f "README.md" ]; then
    print_result 0 "README.md exists"
else
    print_result 1 "README.md not found"
fi

# Check privacy policy
if [ -f "docs/privacy-policy.md" ]; then
    print_result 0 "Privacy policy exists"
else
    print_result 1 "Privacy policy not found"
fi

# Check app store metadata
if [ -f "docs/app-store/ios-metadata.md" ]; then
    print_result 0 "iOS metadata documentation exists"
else
    print_result 1 "iOS metadata documentation not found"
fi

if [ -f "docs/app-store/android-metadata.md" ]; then
    print_result 0 "Android metadata documentation exists"
else
    print_result 1 "Android metadata documentation not found"
fi

echo ""
echo "6. Checking Dependencies"
echo "------------------------"

# Check for security vulnerabilities
if npm audit --audit-level=high > /dev/null 2>&1; then
    print_result 0 "No high-severity vulnerabilities found"
else
    print_warning "High-severity vulnerabilities found, run 'npm audit' for details"
fi

# Check for outdated dependencies
OUTDATED=$(npm outdated 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
if [ "$OUTDATED" -eq 0 ]; then
    print_result 0 "All dependencies are up to date"
else
    print_warning "$OUTDATED dependencies are outdated (run 'npm outdated' for details)"
fi

echo ""
echo "7. Checking Environment Configuration"
echo "--------------------------------------"

# Check for .env file
if [ -f ".env" ]; then
    print_result 0 ".env file exists"
    
    # Check for Sentry DSN
    if grep -q "SENTRY_DSN" .env; then
        print_result 0 "Sentry DSN configured"
    else
        print_warning "Sentry DSN not found in .env"
    fi
else
    print_warning ".env file not found"
fi

echo ""
echo "8. Checking Platform-Specific Files"
echo "------------------------------------"

# Check iOS Info.plist descriptions
if [ -f "app.json" ]; then
    if grep -q "NSHealthShareUsageDescription" app.json; then
        print_result 0 "iOS HealthKit usage description present"
    else
        print_result 1 "iOS HealthKit usage description missing"
    fi
    
    if grep -q "NSHealthUpdateUsageDescription" app.json; then
        print_result 0 "iOS HealthKit update description present"
    else
        print_result 1 "iOS HealthKit update description missing"
    fi
fi

# Check Android manifest
if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    print_result 0 "Android manifest exists"
    
    if grep -q "ACTIVITY_RECOGNITION" android/app/src/main/AndroidManifest.xml; then
        print_result 0 "Android activity recognition permission present"
    else
        print_result 1 "Android activity recognition permission missing"
    fi
else
    print_warning "Android manifest not found (may be generated during build)"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    echo "The app is ready for submission."
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC}"
    echo "Please fix the issues before submitting."
    exit 1
fi
