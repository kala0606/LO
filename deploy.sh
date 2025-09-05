#!/bin/bash

# Orchestra Conductor - Fly.io Deployment Script
# Make executable with: chmod +x deploy.sh

echo "🎵 Orchestra Conductor - Fly.io Deployment"
echo "=========================================="

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   macOS: brew install flyctl"
    echo "   Linux: curl -L https://fly.io/install.sh | sh"
    echo "   Windows: iwr https://fly.io/install.ps1 -useb | iex"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Please log in to Fly.io:"
    fly auth login
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Deploying to Fly.io..."

# Check if app already exists
if [ ! -f fly.toml ]; then
    echo "🆕 First deployment - launching new app..."
    fly launch --no-deploy
fi

# Deploy the app
fly deploy

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your conductor is running at: $(fly status --json | jq -r '.Hostname')"
echo ""
echo "🎵 To test your deployment:"
echo "   1. Open the URL above in your browser"
echo "   2. Adjust the BPM and see it update in real-time"
echo "   3. Connect your drum client to the URL"
echo ""
echo "📊 Useful commands:"
echo "   fly logs          - View real-time logs"
echo "   fly status        - Check app status"
echo "   fly open          - Open app in browser"
echo "   fly scale memory 512 - Increase memory if needed"
