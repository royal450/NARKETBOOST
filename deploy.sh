#!/bin/bash

echo "🚀 Starting Firebase deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔥 Deploying to Firebase..."
     firebase deploy --only hostingy
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌐 Your app is now live!"
    else
        echo "❌ Deployment failed!"
    fi
else
    echo "❌ Build failed!"
fi
