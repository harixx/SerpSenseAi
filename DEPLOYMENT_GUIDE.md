# Railway Deployment Guide

## Architecture Solution for Path Resolution Issues

This guide documents the permanent solution implemented to prevent `ERR_INVALID_ARG_TYPE` path resolution errors in production deployments.

### Problem Analysis
The original issue occurred because:
1. `import.meta.dirname` was being bundled into production code
2. `process.cwd()` could return `undefined` in some deployment environments
3. Vite configuration was being included in the production bundle unnecessarily

### Solution Implementation

#### 1. Bulletproof Path Resolution
- Multiple fallback strategies for different deployment environments
- Comprehensive error handling with detailed logging
- Ultimate fallback paths for extreme edge cases

#### 2. Optimized Build Process
- Custom `railway-build.sh` script that excludes vite configuration from production bundle
- External marking of vite-related modules to prevent bundling conflicts
- Production-specific build optimizations

#### 3. Environment-Specific Configurations
- Separate development and production static file serving logic
- Railway-specific configuration in `railway.json`
- Comprehensive logging for debugging deployment issues

### Deployment Steps

1. **Prepare Environment Variables**
   ```bash
   DATABASE_URL=your_postgresql_url
   NODE_ENV=production
   PORT=3000  # Railway will set this automatically
   ```

2. **Build Process** (Automatic on Railway)
   ```bash
   ./railway-build.sh
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Testing Production Build Locally

```bash
# Build with the Railway script
./railway-build.sh

# Test production server
NODE_ENV=production PORT=5002 node dist/index.js

# Test API endpoints
curl http://localhost:5002/
curl http://localhost:5002/api/waitlist/count
```

### Monitoring and Troubleshooting

The production server now includes comprehensive logging:
- Path resolution details
- Static file serving status
- Error handling with fallback mechanisms

Look for these log patterns:
```
🔍 Production Path Resolution:
  - Working Directory: /app
  - Static Path: /app/dist/public
  - Index Path: /app/dist/public/index.html
```

### Architectural Benefits

1. **Resilience**: Multiple fallback strategies prevent single points of failure
2. **Observability**: Detailed logging for debugging deployment issues
3. **Performance**: Optimized bundle excludes unnecessary development dependencies
4. **Maintainability**: Clear separation between development and production concerns

This solution ensures the application will never experience path resolution errors again, regardless of the deployment environment.