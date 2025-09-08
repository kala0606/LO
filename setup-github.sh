#!/bin/bash

# GitHub Setup Script for Orchestra Conductor
# This script helps initialize a Git repository and prepare for GitHub

echo "🎵 Orchestra Conductor - GitHub Setup"
echo "====================================="

# Initialize git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Orchestra Conductor with Fly.io deployment

- Real-time conductor server using Socket.IO
- WebSocket-based synchronization for musical performances
- Fly.io deployment configuration
- Docker containerization
- Complete documentation and setup scripts"

echo "✅ Git repository ready!"
echo ""
echo "🚀 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/yourusername/your-repo-name.git"
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎵 Happy conducting!"
