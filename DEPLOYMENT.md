# EarthForUs Deployment Guide

This comprehensive guide covers the deployment of the EarthForUs React application to Hostinger shared hosting using our enhanced deployment system.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Scripts](#deployment-scripts)
- [Environment Configuration](#environment-configuration)
- [Security Features](#security-features)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

The EarthForUs deployment system provides automated deployment with:
- **Environment-specific configurations** (Development & Production)
- **Security validation** for production deployments
- **Enhanced logging** with timestamps and environment context
- **Automated build and file preparation**
- **Deployment manifest generation**

## Prerequisites

- Node.js 18+ installed locally
- Hostinger shared hosting account with file manager access
- Domain name configured with Hostinger
- FTP access or file manager access
- Git repository with the application code

## Deployment Scripts

Our deployment system provides two main commands:

### Development Deployment
```bash
npm run deploy:dev
```
- Uses `.env.development` configuration
- Enables debug logging
- Allows test credentials
- Optimized for development/testing

### Production Deployment
```bash
npm run deploy:prod
```
- Uses `.env.production` configuration
- Runs comprehensive security checks
- Disables debug features
- Optimized for live environments

## Environment Configuration

### Development Environment (`.env.development`)
```bash
# API Configuration
VITE_API_BASE=http://localhost:3000/api

# Debug & Logging
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEBUG=true

# Test Credentials (for development only)
VITE_TEST_USER_EMAIL=test@example.com
VITE_TEST_USER_PASSWORD=test123

# Development Flags
VITE_ENVIRONMENT=development
VITE_ALLOW_CONSOLE_LOGS=true
```

### Production Environment (`.env.production`)
```bash
# API Configuration
VITE_API_BASE=https://your-api-domain.com/api

# Security & Logging
VITE_LOG_LEVEL=info
VITE_ENABLE_DEBUG=false

# Production Security (empty in production)
VITE_TEST_USER_EMAIL=
VITE_TEST_USER_PASSWORD=

# Production Flags
VITE_ENVIRONMENT=production
VITE_ALLOW_CONSOLE_LOGS=false
```

## Security Features

### Production Security Validation
The deployment system includes comprehensive security checks for production:

1. **HTTPS Enforcement**: Ensures API endpoints use HTTPS
2. **Test Credentials Check**: Verifies test credentials are removed
3. **Debug Mode Validation**: Confirms debug mode is disabled
4. **API Base URL**: Validates production API configuration
5. **Environment File**: Checks for production environment file
6. **Console Logs**: Scans for console.log statements in build files

### Security Validation Results
- ✅ **PASSED**: All security requirements met
- ⚠️ **WARN**: Non-critical issues detected (deployment continues)
- ❌ **FAILED**: Critical security issues (deployment stops)

## Step-by-Step Deployment

### 1. Initial Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd EarthForUs

# Install dependencies
npm install

# Configure environment files
cp .env.example .env.development
cp .env.example .env.production
```

### 2. Configure Environment Variables

**Development Configuration:**
- Edit `.env.development` with your development API URL
- Keep test credentials for local testing
- Enable debug features as needed

**Production Configuration:**
- Edit `.env.production` with your production API URL
- Remove all test credentials
- Disable debug features
- Ensure HTTPS for API endpoints

### 3. Run Deployment

**For Development/Testing:**
```bash
npm run deploy:dev
```

**For Production:**
```bash
npm run deploy:prod
```

### 4. Deployment Process

The deployment script will:
1. ✅ Validate environment configuration
2. ✅ Run security checks (production only)
3. ✅ Set up environment variables
4. ✅ Build the application
5. ✅ Prepare deployment files
6. ✅ Validate the build
7. ✅ Generate deployment manifest

### 5. Upload to Hostinger

After successful deployment preparation:

1. **Access Hostinger File Manager**
   - Log into your Hostinger control panel
   - Navigate to "Files" → "File Manager"
   - Go to your domain's root directory (usually `public_html`)

2. **Upload Files**
   - Upload all files from the `dist` folder
   - Ensure `.htaccess` file is uploaded (critical for SPA routing)
   - Verify `deployment-manifest.json` is present

3. **Set Environment Variables**
   - Go to "Advanced" → "Environment Variables"
   - Add your production environment variables
   - Key format: `VITE_*` (without the prefix in Hostinger)

## Deployment Output

### Successful Development Deployment
```
🚀 DEPLOYMENT READY!
Next steps:
1. Upload the contents of the 'dist' folder to your Hostinger server
2. Ensure your backend API is properly configured
3. Test the deployment in your target environment
```

### Successful Production Deployment
```
🚀 DEPLOYMENT READY!
Next steps:
1. Upload the contents of the 'dist' folder to your Hostinger server
2. Ensure your backend API is properly configured
3. Test the deployment in your target environment

⚠️  PRODUCTION DEPLOYMENT:
- Verify SSL certificates are properly configured
- Test all API endpoints before going live
- Monitor application logs for any issues
```

## Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check TypeScript errors
npm run build

# Check for syntax errors
npm run lint
```

**2. Security Validation Failures**
- Ensure `.env.production` exists and is properly configured
- Verify API endpoints use HTTPS in production
- Remove test credentials from production environment
- Disable debug mode for production

**3. File Upload Issues**
- Verify `.htaccess` file is uploaded to the correct directory
- Check file permissions on Hostinger
- Ensure all files from `dist` folder are uploaded

**4. Routing Issues (404 on refresh)**
- Confirm `.htaccess` file is present and working
- Check that the file contains proper SPA routing rules
- Verify the file wasn't corrupted during upload

**5. API Connection Issues**
- Verify `VITE_API_BASE` environment variable is set correctly
- Check CORS configuration on your backend
- Ensure backend API is accessible and running

### Debug Mode

Enable debug logging to troubleshoot issues:
```bash
# Set debug environment
export VITE_LOG_LEVEL=debug
export VITE_ENABLE_DEBUG=true

# Run deployment with debug output
npm run deploy:dev
```

## Best Practices

### Security
1. **Never commit sensitive data** to version control
2. **Use HTTPS** for all API endpoints in production
3. **Implement proper CORS** configuration on your backend
4. **Regular security audits** of dependencies
5. **Keep environment files secure** and backed up

### Performance
1. **Optimize images** before deployment
2. **Enable compression** on your Hostinger server
3. **Use CDN** for static assets when possible
4. **Monitor application performance** after deployment
5. **Regular builds** to incorporate latest optimizations

### Maintenance
1. **Test deployments** in development environment first
2. **Keep backups** of working deployments
3. **Monitor error logs** regularly
4. **Update dependencies** periodically
5. **Document custom configurations** for future reference

## Support

If you encounter issues:

1. **Check the deployment logs** for specific error messages
2. **Verify environment configuration** matches your hosting setup
3. **Test API connectivity** independently of the frontend
4. **Review Hostinger documentation** for hosting-specific issues
5. **Check browser console** for client-side errors

For additional help:
- Review the troubleshooting section above
- Check the deployment manifest in the `dist` folder
- Consult Hostinger support for hosting-related issues
- Verify backend API is properly configured and accessible