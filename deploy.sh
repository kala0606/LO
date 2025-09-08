#!/bin/bash

# Orchestra Conductor Deployment Script
# This script helps deploy the conductor to Fly.io

echo "🎵 Orchestra Conductor Deployment Script"
echo "========================================"

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   brew install flyctl"
    echo "   or visit: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Please log in to Fly.io first:"
    echo "   fly auth login"
    exit 1
fi

echo "✅ Fly CLI found and authenticated"

# Deploy the app
echo "🚀 Deploying to Fly.io..."
fly deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Opening your app..."
    fly open
else
    echo "❌ Deployment failed. Check the logs above for details."
    exit 1
fi
