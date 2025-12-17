#!/bin/bash

echo "🚀 Deploying Unified Portfolio..."

echo "🏗️ Building Application..."
npm run build

echo "📦 Deploying To Vercel..."
vercel --prod

echo "✅ Deployment Complete!"
echo ""
