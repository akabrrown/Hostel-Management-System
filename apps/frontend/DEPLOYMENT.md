# Deployment Guide - UPSA Hostel Management System

## Overview
This guide covers deploying the UPSA Hostel Management System to Netlify with automatic continuous deployment from Git.

## Prerequisites
- Node.js 18+ installed
- Git repository with the project code
- Netlify account
- Supabase project set up

## Environment Setup

### 1. Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/upsa_hostel"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_URL="https://your-app.netlify.app"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="UPSA Hostel Management <noreply@upsamail.edu.gh>"
```

### 2. Build Configuration
The project uses Next.js with the following build settings:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18

## Netlify Deployment

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. Choose "Add new site"

### Step 2: Connect Git Repository
1. Select "Git-based deployment"
2. Choose your Git provider (GitHub, GitLab, Bitbucket)
3. Authorize Netlify access to your repositories
4. Select the UPSA Hostel Management repository

### Step 3: Configure Build Settings
Netlify will automatically detect Next.js. Verify these settings:

```
Build command: npm run build
Publish directory: .next
Node version: 18
```

### Step 4: Set Environment Variables
1. Go to Site settings → Build & deploy → Environment
2. Add all environment variables from `.env.local`
3. Mark sensitive variables as "Protected"

### Step 5: Deploy
1. Click "Deploy site"
2. Netlify will build and deploy your application
3. Once deployed, you'll get a URL like `https://your-app.netlify.app`

## Custom Domain Setup

### Step 1: Add Custom Domain
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `hostel.upsa.edu.gh`)

### Step 2: Configure DNS
Add these DNS records:
```
Type: A
Name: @
Value: 199.36.158.100

Type: CNAME
Name: www
Value: your-app.netlify.app
```

### Step 3: SSL Certificate
Netlify automatically provides SSL certificates for custom domains.

## Continuous Deployment

### Automatic Deployments
- Push to `main` branch → Automatic production deployment
- Push to other branches → Preview deployments

### Deployment Hooks
1. Go to Site settings → Build & deploy → Continuous Deployment
2. Configure build hooks for external services
3. Use webhook URLs for CI/CD integration

## Environment-Specific Configurations

### Production
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-app.netlify.app
APP_URL=https://your-app.netlify.app
```

### Staging
```bash
NODE_ENV=staging
NEXTAUTH_URL=https://staging--your-app.netlify.app
APP_URL=https://staging--your-app.netlify.app
```

## API Routes and Functions

### Netlify Functions
API routes are automatically converted to Netlify Functions:
- `/api/auth/*` → Serverless functions
- `/api/students/*` → Serverless functions
- `/api/admin/*` → Serverless functions

### Headers and Redirects
The `netlify.toml` file configures:
- Security headers
- API CORS headers
- Route redirects for admin/porter/director sections

## Monitoring and Analytics

### Netlify Analytics
1. Go to Site settings → Analytics
2. Enable site analytics
3. Monitor page views, bandwidth, and performance

### Error Monitoring
Set up error tracking:
1. Configure error reporting service
2. Add error tracking to API routes
3. Monitor deployment failures

## Performance Optimization

### Build Optimization
- Next.js automatically optimizes bundles
- Images are optimized with next/image
- CSS is minified and critical CSS is extracted

### Caching
- Static assets are cached at CDN edge
- API responses can be cached with appropriate headers
- Browser caching is configured via headers

## Security Considerations

### Environment Variables
- Never commit `.env.local` to Git
- Use Netlify's protected environment variables
- Rotate secrets regularly

### Headers
Security headers are configured in `netlify.toml`:
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### API Security
- Rate limiting implemented
- Input validation on all endpoints
- HTTPS enforced in production

## Troubleshooting

### Common Issues

#### Build Failures
1. Check build logs in Netlify dashboard
2. Verify all dependencies are in package.json
3. Ensure environment variables are set correctly

#### API Errors
1. Check function logs in Netlify dashboard
2. Verify database connection strings
3. Test API endpoints locally first

#### Authentication Issues
1. Verify NEXTAUTH_URL matches deployment URL
2. Check NEXTAUTH_SECRET is set
3. Ensure callback URLs are configured in OAuth providers

#### Database Connection Issues
1. Verify Supabase credentials
2. Check connection string format
3. Ensure Supabase project is active

### Debug Mode
Enable debug logging:
```bash
NODE_ENV=development
DEBUG=*
```

### Rollback Deployments
1. Go to Deployments in Netlify dashboard
2. Find the previous successful deployment
3. Click "Publish deploy" to rollback

## Maintenance

### Updates
1. Update dependencies: `npm update`
2. Test changes locally
3. Push to trigger deployment

### Backups
- Database backups handled by Supabase
- Code versioned in Git
- Configuration backed up in Netlify

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flows
- [ ] Check API endpoints
- [ ] Test file uploads
- [ ] Verify email notifications
- [ ] Test responsive design
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test custom domain (if configured)
- [ ] Set up monitoring alerts

## Support

### Documentation
- [API Documentation](./docs/API.md)
- [Component Documentation](./docs/COMPONENTS.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

### Contact
- Netlify Support: https://www.netlify.com/support/
- Supabase Support: https://supabase.com/support
- Project Issues: Create GitHub issue
