#!/bin/bash

# Deploy QPHAROS Website Updates to spectrixrd.com
# Date: October 30, 2025

echo "🚀 Deploying QPHAROS Website Updates..."
echo "=========================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "qpharos.html" ]; then
    echo "❌ Error: qpharos.html not found. Are you in the bioql_website directory?"
    exit 1
fi

echo "📋 Files to be deployed:"
echo "  ✅ qpharos.html (NEW)"
echo "  ✅ index.html (UPDATED - header + blog section)"
echo "  ✅ agent.html (UPDATED - v7.0.4)"
echo "  ✅ bioql-assistant-7.0.4.vsix (NEW)"
echo ""

# Show git status
echo "📊 Current git status:"
git status --short
echo ""

# Ask for confirmation
read -p "🤔 Do you want to proceed with deployment? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo ""
echo "📦 Adding files to git..."
git add qpharos.html
git add index.html
git add agent.html
git add bioql-assistant-7.0.4.vsix
git add WEBSITE_UPDATES_QPHAROS.md
git add deploy_qpharos_update.sh

echo ""
echo "💾 Committing changes..."
git commit -m "Add QPHAROS page, update Agent to v7.0.4, add blog section to homepage

- NEW: Complete QPHAROS page (qpharos.html) with 4 usage schemas
- NEW: Blog section in index.html homepage
- UPDATED: Navigation - removed Blog link, added QPHAROS link
- UPDATED: agent.html - all references from v7.0.3 to v7.0.4
- UPDATED: Hero badge in index.html - v7.0.4 QPHAROS Integration
- ADDED: bioql-assistant-7.0.4.vsix (2.5 MB)

QPHAROS Features:
- 5-Layer quantum architecture
- 4 usage schemas (Simple/Functional/OOP/Layer)
- Complete installation guide
- Code examples for all schemas
- VS Code Agent integration
- PyPI package link

Version: BioQL Agent v7.0.4 + QPHAROS v1.1.0
"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
else
    echo "❌ Commit failed!"
    exit 1
fi

echo ""
echo "🌐 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "🎉 Website updates deployed to GitHub!"
    echo ""
    echo "📍 Changes will be live at:"
    echo "   • https://www.spectrixrd.com/qpharos.html"
    echo "   • https://www.spectrixrd.com (homepage with blog section)"
    echo "   • https://www.spectrixrd.com/agent.html (v7.0.4)"
    echo ""
    echo "⏱️  GitHub Pages typically updates within 1-5 minutes"
    echo ""
    echo "🔍 Verify deployment:"
    echo "   1. Wait 2-3 minutes"
    echo "   2. Visit https://www.spectrixrd.com/qpharos.html"
    echo "   3. Check navigation has QPHAROS link"
    echo "   4. Verify blog section on homepage"
    echo "   5. Test agent.html download links (v7.0.4)"
    echo ""
    echo "📊 Deployment summary:"
    echo "   Files updated: 3 (qpharos.html, index.html, agent.html)"
    echo "   Files added: 2 (bioql-assistant-7.0.4.vsix, docs)"
    echo "   Version: BioQL Agent v7.0.4 + QPHAROS v1.1.0"
    echo ""
else
    echo ""
    echo "❌ Push to GitHub failed!"
    echo "Please check your internet connection and try again."
    exit 1
fi
