# Vercel Deployment Guide for Imperius Landing Page

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Neon PostgreSQL database (current DATABASE_URL will work)
3. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket

## Environment Variables

Set these environment variables in your Vercel project dashboard:

```bash
DATABASE_URL=your_neon_database_url
PGHOST=your_pg_host
PGPORT=your_pg_port  
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=your_pg_database
NODE_ENV=production
```

## Deployment Steps

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from your project directory:
```bash
vercel --prod
```

4. Follow the prompts:
   - **Set up and deploy?** Yes
   - **Which scope?** Your personal account or team
   - **Link to existing project?** No
   - **Project name:** imperius-landing-page
   - **Directory:** ./
   - **Override settings?** No (vercel.json will handle this)

The project is already configured with `vercel.json`, so Vercel will automatically:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **API Routes:** `/api/*` → serverless functions

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

## Database Setup

After deployment, run database migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project
vercel link

# Run database push
vercel env pull .env.local
npm run db:push
```

## Custom Domain (Optional)

1. Go to your project settings in Vercel dashboard
2. Navigate to "Domains" tab
3. Add your custom domain
4. Configure DNS settings as instructed

## Troubleshooting

### Build Errors
- Ensure all environment variables are set in Vercel dashboard
- Check build logs in Vercel deployment dashboard

### Database Connection Issues
- Verify DATABASE_URL is correctly set
- Ensure Neon database allows connections from Vercel IPs

### Static Files Not Loading
- Verify `dist/public` directory is created during build
- Check that assets are properly referenced with relative paths

## Production Features

✅ **Enterprise Security**: Admin authentication with bcrypt encryption  
✅ **Real-time WebSockets**: Live waitlist updates and connection monitoring  
✅ **A/B Testing**: Statistical testing with confidence intervals  
✅ **Analytics Tracking**: Comprehensive user behavior and conversion tracking  
✅ **PostgreSQL Database**: Scalable data persistence with Neon  
✅ **Responsive Design**: Optimized for desktop and mobile  
✅ **Premium UI**: Dark theme with crimson accents and animations  

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Ensure database connectivity
4. Review build output for errors

Your Imperius landing page will be live at: `https://your-project-name.vercel.app`