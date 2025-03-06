#!/bin/bash

# Script to package Chrome extension for submission to the Chrome Web Store
# Created for chrome-auto-image-blocker

echo "🔧 Packaging Chrome extension for Web Store submission..."

# Set variables
OUTPUT_ZIP="extension.zip"
OUTPUT_DIR="dist"

# Create dist directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Remove existing zip file if it exists
if [ -f "$OUTPUT_DIR/$OUTPUT_ZIP" ]; then
  echo "🗑️  Removing existing package..."
  rm "$OUTPUT_DIR/$OUTPUT_ZIP"
fi

# Create new zip file with only the required files
echo "📦 Creating new package with required files..."
zip -r "$OUTPUT_DIR/$OUTPUT_ZIP" manifest.json background.js assets/icons -x "*.DS_Store" "*.git*" "*.swp" "._*"

# Display result
if [ $? -eq 0 ]; then
  echo "✅ Package created successfully at $OUTPUT_DIR/$OUTPUT_ZIP"
  echo "📏 Package size: $(du -h "$OUTPUT_DIR/$OUTPUT_ZIP" | cut -f1)"
  echo "🌐 Ready for Chrome Web Store submission!"
else
  echo "❌ Failed to create package"
  exit 1
fi 