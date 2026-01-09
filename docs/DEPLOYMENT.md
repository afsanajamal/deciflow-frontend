# Deployment Documentation

## Overview

DeciFlow Frontend is a Nuxt 3 application that can be deployed to various hosting platforms. This guide covers deployment to popular platforms and best practices.

## Prerequisites

Before deploying, ensure:

- [x] All tests pass (`npm run test:run` and `npm run e2e`)
- [x] No linting errors (`npm run lint`)
- [x] TypeScript compiles without errors (`npm run type-check`)
- [x] Production build succeeds (`npm run build`)
- [x] Environment variables configured
- [x] Backend API is accessible from deployment environment

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides zero-configuration deployment for Nuxt 3 applications with automatic CI/CD.

#### Steps:

1. **Install Vercel CLI** (optional, for local deployment)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub Integration** (recommended)
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel automatically detects Nuxt 3
   - Configure environment variables
   - Click "Deploy"

3. **Configure Environment Variables** in Vercel Dashboard
   ```env
   NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
   NUXT_PUBLIC_APP_NAME=DeciFlow
   ```

4. **Custom Domain** (optional)
   - Add custom domain in Vercel dashboard
   - Configure DNS records as instructed
   - SSL automatically provisioned

#### Vercel Configuration

Create `vercel.json` (optional, for custom settings):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nuxtjs",
  "outputDirectory": ".output/public"
}
```

### 2. Netlify

Netlify also provides excellent support for Nuxt 3 applications.

#### Steps:

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .output/public
   ```

3. **Environment Variables**
   ```env
   NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
   ```

4. **Deploy**
   - Click "Deploy site"
   - Automatic deployments on every push

#### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Docker Deployment

Deploy using Docker containers for consistent environments.

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.output /app/.output

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Start application
CMD ["node", ".output/server/index.mjs"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE=http://backend:8000/api
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: your-backend-image
    ports:
      - "8000:8000"
    restart: unless-stopped
```

#### Build and Run

```bash
# Build image
docker build -t deciflow-frontend .

# Run container
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api \
  deciflow-frontend

# Or use Docker Compose
docker-compose up -d
```

### 4. Static Hosting (AWS S3, GitHub Pages)

For static deployment (if not using SSR):

#### Generate Static Files

```bash
npm run generate
```

This creates a `.output/public` directory with static files.

#### Deploy to AWS S3

```bash
# Install AWS CLI
aws configure

# Sync files to S3
aws s3 sync .output/public s3://your-bucket-name

# Configure bucket for static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

#### Deploy to GitHub Pages

1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add deploy script to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "npm run generate && gh-pages -d .output/public"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### 5. Traditional Server (VPS, EC2)

Deploy to a traditional server using PM2 for process management.

#### Server Setup

1. **Install Node.js 20+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/deciflow-frontend.git
   cd deciflow-frontend
   ```

4. **Install Dependencies**
   ```bash
   npm ci --production
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   # Set NUXT_PUBLIC_API_BASE and other variables
   ```

7. **Start with PM2**
   ```bash
   pm2 start .output/server/index.mjs --name deciflow-frontend
   pm2 save
   pm2 startup
   ```

#### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'deciflow-frontend',
    script: '.output/server/index.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      NUXT_HOST: '0.0.0.0',
      NUXT_PORT: 3000,
      NUXT_PUBLIC_API_BASE: 'https://api.yourdomain.com/api'
    }
  }]
}
```

Start with:
```bash
pm2 start ecosystem.config.js
```

#### Nginx Reverse Proxy

Configure Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/deciflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

### Production Environment Variables

```env
# API Configuration
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api

# App Configuration
NUXT_PUBLIC_APP_NAME=DeciFlow
NODE_ENV=production

# Server Configuration (for Node.js deployment)
NUXT_HOST=0.0.0.0
NUXT_PORT=3000
```

### Environment-Specific Variables

**Development**:
```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
```

**Staging**:
```env
NUXT_PUBLIC_API_BASE=https://staging-api.yourdomain.com/api
```

**Production**:
```env
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
```

## Build Optimization

### Production Build

```bash
npm run build
```

This creates an optimized build in `.output/` directory.

### Build Analysis

Analyze bundle size:

```bash
# Add to nuxt.config.ts
export default defineNuxtConfig({
  build: {
    analyze: true
  }
})

# Run build
npm run build
```

### Performance Optimizations

**1. Enable Compression**

In `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true
  }
})
```

**2. Image Optimization**

Use Nuxt Image module:
```bash
npm install @nuxt/image
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image']
})
```

**3. Code Splitting**

Automatic with Nuxt 3, but can be optimized:
```typescript
// Lazy load components
const HeavyComponent = defineAsyncComponent(() =>
  import('~/components/HeavyComponent.vue')
)
```

## Monitoring and Logging

### Error Tracking (Sentry)

1. **Install Sentry**
   ```bash
   npm install @sentry/vue
   ```

2. **Configure Sentry**
   ```typescript
   // plugins/sentry.client.ts
   import * as Sentry from '@sentry/vue'

   export default defineNuxtPlugin((nuxtApp) => {
     Sentry.init({
       app: nuxtApp.vueApp,
       dsn: 'YOUR_SENTRY_DSN',
       environment: process.env.NODE_ENV
     })
   })
   ```

### Analytics (Google Analytics)

```bash
npm install @nuxtjs/google-analytics
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/google-analytics'],
  googleAnalytics: {
    id: 'GA_MEASUREMENT_ID'
  }
})
```

### Application Monitoring

Use PM2 monitoring (for VPS deployment):

```bash
# View logs
pm2 logs deciflow-frontend

# Monitor resources
pm2 monit

# Web dashboard
pm2 web
```

## CI/CD Pipeline

### GitHub Actions Deployment

Automatic deployment on push to main:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Build
        run: npm run build
        env:
          NUXT_PUBLIC_API_BASE: ${{ secrets.API_BASE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback Strategy

### Vercel

Rollback to previous deployment:
- Go to Vercel dashboard
- Select "Deployments"
- Find previous successful deployment
- Click "Promote to Production"

### Docker

Keep previous images tagged:
```bash
# Tag current version
docker tag deciflow-frontend deciflow-frontend:v1.0.0

# Rollback
docker stop deciflow-frontend
docker run -d --name deciflow-frontend deciflow-frontend:v1.0.0
```

### PM2

Use PM2 deployment history:
```bash
pm2 deploy ecosystem.config.js production revert 1
```

## Health Checks

### Application Health Endpoint

Create health check endpoint:

```typescript
// server/api/health.get.ts
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  }
})
```

### Monitoring Health

```bash
# Simple check
curl https://yourdomain.com/api/health

# Automated monitoring (cron job)
*/5 * * * * curl -f https://yourdomain.com/api/health || systemctl restart deciflow-frontend
```

## Troubleshooting

### Common Issues

**Build fails with out of memory**:
```bash
# Increase Node.js memory
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

**Environment variables not working**:
- Ensure variables are prefixed with `NUXT_PUBLIC_` for client-side access
- Rebuild after changing environment variables
- Check runtime config in `nuxt.config.ts`

**404 on routes after deployment**:
- Configure server for SPA mode (serve index.html for all routes)
- Check Nginx/Apache configuration

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in source code)
- [ ] API endpoints use HTTPS
- [ ] CORS configured on backend
- [ ] Security headers configured
- [ ] Dependencies updated (npm audit)
- [ ] No sensitive data in logs
- [ ] Rate limiting on API

## Performance Checklist

- [ ] Production build tested
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized
- [ ] Compression enabled
- [ ] CDN configured (if applicable)
- [ ] Caching headers configured
- [ ] Lazy loading implemented
- [ ] Code splitting optimized

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [Testing](./TESTING.md)
- [Components](./COMPONENTS.md)
