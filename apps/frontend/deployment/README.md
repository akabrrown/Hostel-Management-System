# UPSA Hostel Management System - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the UPSA Hostel Management System to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Environment Variables](#environment-variables)
6. [Security Configuration](#security-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL 14.x or higher
- Redis 6.x or higher (for caching)
- Nginx (for reverse proxy)

### Required Services
- Supabase account (for database and auth)
- Email service provider (SMTP)
- SMS service provider (optional)
- Domain name and SSL certificate

## Environment Setup

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd upsa-hostel-management

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Production Environment
```bash
# Install dependencies
npm ci --production

# Build the application
npm run build

# Start production server
npm start
```

## Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the database schema:
```sql
-- Execute the database-schema.sql file
```

3. Set up Row Level Security (RLS):
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ... etc.
```

4. Create storage buckets:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('documents', 'documents', false);
```

### Environment Variables

Create `.env.production` with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/upsa_hostel

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=UPSA Hostel Management
SMTP_FROM_EMAIL=noreply@upsamail.edu.gh

# SMS Configuration
MTN_API_KEY=your-mtn-api-key
MTN_SENDER_ID=UPSA
VODAFONE_API_KEY=your-vodafone-api-key
VODAFONE_SENDER_ID=UPSA
AIRTELTIGO_API_KEY=your-airteltigo-api-key
AIRTELTIGO_SENDER_ID=UPSA
DEFAULT_SMS_PROVIDER=mtn

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# Security Configuration
NEXT_PUBLIC_API_URL=https://api.upsa-hostel.com
CORS_ORIGIN=https://upsa-hostel.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Configure environment variables in Vercel dashboard

### Option 2: Docker Deployment

1. Create Dockerfile:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

2. Create docker-compose.yml:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=upsa_hostel
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

3. Deploy:
```bash
docker-compose up -d
```

### Option 3: Traditional Server Deployment

1. Set up Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name upsa-hostel.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name upsa-hostel.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. Set up PM2 for process management:
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

3. Create ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'upsa-hostel',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

## Security Configuration

### SSL/TLS Setup
1. Obtain SSL certificate (Let's Encrypt recommended)
2. Configure HTTPS in Nginx
3. Set up automatic certificate renewal

### Security Headers
Add these headers to your Nginx configuration:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Firewall Configuration
```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (with rate limiting)
ufw limit 22/tcp

# Enable firewall
ufw enable
```

## Monitoring and Logging

### Application Monitoring
1. Set up Sentry for error tracking:
```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

2. Configure logging:
```javascript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

### Server Monitoring
1. Install monitoring tools:
```bash
# System monitoring
sudo apt-get install htop iotop

# Log monitoring
sudo apt-get install logrotate

# Network monitoring
sudo apt-get install nethogs
```

2. Set up log rotation:
```bash
# /etc/logrotate.d/upsa-hostel
/var/log/upsa-hostel/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

## Backup and Recovery

### Database Backups
1. Set up automated backups:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="upsa_hostel"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

2. Schedule with cron:
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### File Backups
```bash
# Backup uploaded files
rsync -av /var/www/uploads/ /backups/files/

# Backup configuration files
rsync -av /etc/nginx/ /backups/config/
```

### Recovery Procedures
1. Database recovery:
```bash
# Restore from backup
gunzip backup_20231201_020000.sql.gz
psql -d upsa_hostel < backup_20231201_020000.sql
```

2. File recovery:
```bash
# Restore uploaded files
rsync -av /backups/files/ /var/www/uploads/
```

## Performance Optimization

### Caching
1. Redis configuration:
```bash
# /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

2. Nginx caching:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization
1. Create indexes:
```sql
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
```

2. Optimize queries:
```sql
-- Use EXPLAIN ANALYZE to analyze queries
EXPLAIN ANALYZE SELECT * FROM students WHERE user_id = 'xxx';
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connection
   - Check log files

2. **Database connection errors**
   - Verify database is running
   - Check connection string
   - Verify credentials

3. **Performance issues**
   - Check database indexes
   - Monitor memory usage
   - Analyze slow queries

4. **SSL certificate issues**
   - Verify certificate validity
   - Check certificate chain
   - Renew if expired

### Log Analysis
```bash
# Check application logs
tail -f /var/log/upsa-hostel/combined.log

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check system logs
journalctl -u nginx -f
```

### Health Checks
Create health check endpoint:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  })
}
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL certificates installed
- [ ] Backup procedures tested
- [ ] Monitoring configured

### Post-deployment
- [ ] Application health check
- [ ] Database connectivity test
- [ ] Email/SMS services test
- [ ] Performance monitoring
- [ ] Log monitoring setup
- [ ] Security headers verified

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Contact the development team
4. Check system documentation

## Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies monthly
- Review and rotate secrets quarterly
- Backup verification monthly
- Performance review weekly
- Security audit quarterly

### Update Process
1. Create backup
2. Deploy to staging
3. Run tests
4. Deploy to production
5. Monitor performance
6. Rollback if needed
