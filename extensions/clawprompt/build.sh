#!/bin/bash
# ClawPrompt Build Script
# Packages the extension for Chrome Web Store

set -e

EXTENSION_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="${EXTENSION_DIR}/build"
PACKAGE_NAME="clawprompt-extension.zip"

echo "🏗️ Building ClawPrompt extension..."

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy extension files
echo "📁 Copying extension files..."
cp -r "$EXTENSION_DIR/manifest.json" "$BUILD_DIR/"
cp -r "$EXTENSION_DIR/icons" "$BUILD_DIR/"
cp -r "$EXTENSION_DIR/popup" "$BUILD_DIR/"
cp -r "$EXTENSION_DIR/options" "$BUILD_DIR/"
cp -r "$EXTENSION_DIR/background" "$BUILD_DIR/"
cp -r "$EXTENSION_DIR/content" "$BUILD_DIR/"
cp -r "$EXTENSION_DIR/templates" "$BUILD_DIR/" 2>/dev/null || true
cp -r "$EXTENSION_DIR/_locales" "$BUILD_DIR/" 2>/dev/null || true

# Create icons if needed
if command -v convert &> /dev/null; then
    echo "🎨 Converting SVG icons to PNG..."
    convert "$EXTENSION_DIR/icons/icon.svg" -resize 16x16 "$BUILD_DIR/icons/icon16.png"
    convert "$EXTENSION_DIR/icons/icon.svg" -resize 32x32 "$BUILD_DIR/icons/icon32.png"
    convert "$EXTENSION_DIR/icons/icon.svg" -resize 48x48 "$BUILD_DIR/icons/icon48.png"
    convert "$EXTENSION_DIR/icons/icon.svg" -resize 128x128 "$BUILD_DIR/icons/icon128.png"
else
    echo "⚠️ ImageMagick not found. Please ensure PNG icons exist."
fi

# Create zip package
echo "📦 Creating extension package..."
cd "$BUILD_DIR"
zip -r "$EXTENSION_DIR/$PACKAGE_NAME" .

echo "✅ Build complete!"
echo "📦 Package: $EXTENSION_DIR/$PACKAGE_NAME"
echo "📂 Build directory: $BUILD_DIR"
