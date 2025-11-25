#!/bin/bash

# Package TabEcho extension for Chrome Web Store submission
# This script creates a clean ZIP file ready for upload

set -e

echo "🎁 TabEcho Chrome Web Store Packager"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Build the extension
echo "📦 Building extension..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

# Generate icons
echo "🎨 Generating icons..."
npm run generate-icons

# Get version from manifest
VERSION=$(node -pe "JSON.parse(require('fs').readFileSync('dist/manifest.json', 'utf8')).version")
echo "📌 Version: $VERSION"

# Create package directory
PACKAGE_NAME="tabecho-extension-v${VERSION}"
ZIP_NAME="${PACKAGE_NAME}.zip"

echo "📂 Creating package: ${ZIP_NAME}"

# Remove old package if exists
if [ -f "$ZIP_NAME" ]; then
    rm "$ZIP_NAME"
    echo "🗑️  Removed old package"
fi

# Create ZIP from dist folder
cd dist
zip -r "../${ZIP_NAME}" . -x "*.DS_Store" "*.map" "*.svg"
cd ..

# Check ZIP was created
if [ -f "$ZIP_NAME" ]; then
    SIZE=$(du -h "$ZIP_NAME" | cut -f1)
    echo ""
    echo "✅ Package created successfully!"
    echo "📦 File: ${ZIP_NAME}"
    echo "📏 Size: ${SIZE}"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to https://chrome.google.com/webstore/devconsole"
    echo "2. Click 'New Item'"
    echo "3. Upload: ${ZIP_NAME}"
    echo "4. Fill out store listing"
    echo "5. Submit for review"
    echo ""
    echo "🎉 Ready for Chrome Web Store submission!"
else
    echo "❌ Error: Failed to create package"
    exit 1
fi
