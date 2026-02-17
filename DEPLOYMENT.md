# Deployment Guide

This guide will help you deploy your Job Board application to production.

## Prerequisites

1. GitHub account
2. NeonDB account (for database)
3. Netlify/Vercel account (for frontend)
4. Render/Railway/Heroku account (for backend)

## Step 1: Database Setup (NeonDB)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:password@host/database?sslmode=require`)
4. Save this for backend deployment

## Step 2: Backend Deployment

### Option A: Render (Recommended)

1. Push your code to GitHub
2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

6. Add Environment Variables:
   ```
   DATABASE_URL=your-neondb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```

7. Click "Create Web Service"
8. Wait for deployment to complete
9. Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Option B: Railway

1. Go to https://railway.app
2. Connect GitHub repository
3. Select `server` folder as root
4. Add environment variables (same as above)
5. Deploy

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set root directory:
   ```bash
   echo "web: cd server && npm start" > Procfile
   ```
5. Add environment variables:
   ```bash
   heroku config:set DATABASE_URL=your-db-url
   heroku config:set JWT_SECRET=your-secret
   ```
6. Push to Heroku:
   ```bash
   git push heroku main
   ```

## Step 3: Frontend Deployment

### Option A: Netlify (Recommended)

1. Push your code to GitHub
2. Go to https://netlify.com and sign up
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure:
   - **Base directory**: Leave empty
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

6. Add Environment Variables:
   - Go to Site Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

7. Click "Deploy site"
8. Your site will be live at `https://your-site-name.netlify.app`

### Option B: Vercel

1. Go to https://vercel.com and sign up
2. Import your GitHub repository
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
7. Deploy

### Option C: GitHub Pages

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

3. Add to package.json scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Step 4: Database Migrations

After backend is deployed, run migrations:

### Using Render

1. Go to your Render dashboard
2. Select your web service
3. Go to "Shell" tab
4. Run:
   ```bash
   npm run prisma:migrate
   ```

### Using Railway

1. Go to your Railway project
2. Click on your service
3. Open terminal
4. Run migrations

## Step 5: Testing

1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test job posting (as employer)
5. Test job application (as candidate)
6. Check all API endpoints work correctly

## Environment Variables Summary

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.netlify.app
```

### Frontend (Netlify/Vercel)
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Custom Domain (Optional)

### For Frontend (Netlify)
1. Go to Domain Settings
2. Add custom domain
3. Follow DNS configuration instructions

### For Backend (Render)
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is correct
- Check if database allows external connections
- Verify SSL mode is set correctly

### CORS Errors
- Ensure CLIENT_URL in backend matches your frontend URL
- Check CORS middleware configuration

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are listed in package.json
- Review build logs for specific errors

### API Not Working
- Verify API_URL in frontend env variables
- Check backend is running and accessible
- Test API endpoints directly with Postman

## Monitoring

### Backend Monitoring (Render)
1. Go to your service dashboard
2. Check "Metrics" tab for performance
3. Review logs for errors

### Frontend Monitoring (Netlify)
1. Analytics available in dashboard
2. Check Deploy logs for issues
3. Use browser console for client-side errors

## Continuous Deployment

Both Netlify and Render support automatic deployments:

1. Push changes to your GitHub repository
2. Services automatically detect changes
3. New deployment starts automatically
4. Changes go live after successful build

## Security Best Practices

1. Never commit `.env` files
2. Use strong JWT secrets (32+ characters)
3. Enable HTTPS on all deployments
4. Regularly update dependencies
5. Monitor for security vulnerabilities
6. Use environment variables for all secrets

## Performance Optimization

1. Enable CDN on Netlify/Vercel
2. Use database connection pooling
3. Add database indexes for common queries
4. Implement caching where appropriate
5. Optimize images and assets

## Backup Strategy

1. NeonDB provides automatic backups
2. Regularly export your data
3. Keep copy of environment variables secure
4. Document your deployment process

## Support

If you encounter issues:
1. Check deployment logs
2. Review error messages
3. Verify environment variables
4. Test locally first
5. Consult platform documentation

## Cost Estimation

### Free Tier Limits
- **NeonDB**: 10GB storage, 3 projects
- **Render**: 750 hours/month, sleeps after inactivity
- **Netlify**: 100GB bandwidth, 300 build minutes
- **Railway**: $5 free credit monthly

For production apps with traffic, expect:
- Database: $10-30/month
- Backend: $7-25/month
- Frontend: Usually free
- **Total**: $20-60/month

---

Congratulations! Your Job Board is now live!
