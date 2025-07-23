#!/bin/bash
set -e

echo "🚀 Starting Railway-optimized build process..."

# Build frontend
echo "📦 Building frontend with Vite..."
npm run db:push
vite build

# Build backend with improved bundling
echo "🔧 Building backend for production..."
esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:./vite.ts \
  --external:./vite \
  --define:process.env.NODE_ENV='"production"' \
  --minify

echo "✅ Build completed successfully!"
echo "📂 Production files ready in dist/"
ls -la dist/