#!/bin/bash

echo "🚀 Setting up EAS Build for Resume Tracker"
echo "=========================================="

# Check if user is logged in
echo "📋 Checking login status..."
npx eas-cli@latest whoami

echo ""
echo "🔧 Next steps to run manually:"
echo "1. Create EAS project: npx eas-cli@latest project:init"
echo "2. Configure credentials: npx eas-cli@latest credentials:configure --platform android"
echo "3. Build APK: npx eas-cli@latest build --platform android --profile preview"
echo ""
echo "📱 For each step, when prompted:"
echo "   - Project init: Answer 'y' to create project"
echo "   - Credentials: Choose 'Let EAS manage your keystore'"
echo "   - Build: Wait for build to complete"
echo ""
echo "✅ Configuration files are ready!"
echo "   - eas.json: EAS build configuration"
echo "   - app.json: Updated with owner field"
echo ""
echo "🎯 Ready to build your APK for private distribution!"
