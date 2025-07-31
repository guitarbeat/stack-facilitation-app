# Render Deployment Guide

This guide will walk you through deploying the Stack Facilitation App to Render.

## Prerequisites

- Render account (free tier is sufficient to start)
- GitHub repository with the code (already done: https://github.com/guitarbeat/stack-facilitation-app)

## Deployment Steps

### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `stack-facilitation-db`
   - **Database**: `stack_facilitation`
   - **User**: `stack_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (sufficient for testing)
4. Click "Create Database"
5. **Save the connection details** - you'll need the Internal Database URL

### 2. Deploy Backend Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `guitarbeat/stack-facilitation-app`
3. Configure:
   - **Name**: `stack-facilitation-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (click "Advanced"):
   ```
   NODE_ENV=production
   DATABASE_URL=[Internal Database URL from step 1]
   JWT_SECRET=[Generate a random 32-character string]
   CORS_ORIGIN=https://stack-facilitation-frontend.onrender.com
   ```

5. Click "Create Web Service"

### 3. Deploy Frontend Service

1. Click "New +" → "Static Site"
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `stack-facilitation-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://stack-facilitation-backend.onrender.com
   VITE_WS_URL=wss://stack-facilitation-backend.onrender.com
   ```

5. Click "Create Static Site"

### 4. Update CORS Configuration

After both services are deployed:

1. Go to your backend service settings
2. Update the `CORS_ORIGIN` environment variable with your actual frontend URL
3. Trigger a redeploy

## Important Notes

### Free Tier Limitations

- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes 30+ seconds
- **Database**: 90-day expiration on free PostgreSQL
- **Build Minutes**: 500 minutes/month limit

### Production Considerations

For production use, consider upgrading to paid plans:
- **Starter Plan** ($7/month): No sleep, faster builds
- **PostgreSQL Standard** ($7/month): No expiration, daily backups

### Custom Domains

To use a custom domain:
1. Go to service settings → "Custom Domains"
2. Add your domain
3. Configure DNS records as shown

## Troubleshooting

### Common Issues

1. **Build Failures**: Check build logs for missing dependencies
2. **Database Connection**: Verify DATABASE_URL is correct
3. **CORS Errors**: Ensure CORS_ORIGIN matches frontend URL
4. **WebSocket Issues**: Check WSS URL configuration

### Useful Commands

```bash
# Check database connection
npx prisma db pull

# Reset database (if needed)
npx prisma migrate reset

# View logs
render logs [service-name]
```

## Monitoring

- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory, and request metrics
- **Alerts**: Set up email notifications for downtime

## Scaling

When ready to scale:
1. Upgrade to paid plans
2. Consider multiple regions
3. Add Redis for session storage
4. Implement database read replicas

Your Stack Facilitation App will be available at:
- **Frontend**: `https://stack-facilitation-frontend.onrender.com`
- **Backend API**: `https://stack-facilitation-backend.onrender.com`

The deployment typically takes 5-10 minutes for the initial setup.

