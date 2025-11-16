# EarthForUs Deployment Guide for Hostinger

This guide explains how to deploy the EarthForUs React application to Hostinger shared hosting.

## Prerequisites

- Hostinger shared hosting account with file manager access
- Domain name configured with Hostinger
- FTP access or file manager access

## Build Process

1. **Build the application locally:**
   ```bash
   npm run build
   ```

2. **This creates a `dist` folder with all production files.**

## Hostinger Deployment Steps

### 1. Upload Files

1. Access your Hostinger file manager or use FTP
2. Navigate to the `public_html` directory (or your domain's root directory)
3. Upload all files from the `dist` folder to this directory
4. **Important:** Upload the `.htaccess` file to enable proper SPA routing

### 2. Configure Environment Variables

1. Go to your Hostinger control panel
2. Find the "Environment Variables" section (usually under Advanced or Developer tools)
3. Add the following environment variables:

   ```
   VITE_API_BASE=https://your-api-domain.com/api
   VITE_LOG_LEVEL=info
   ```

4. **Note:** Remove test credentials in production:
   ```
   VITE_TEST_USER_EMAIL=
   VITE_TEST_USER_PASSWORD=
   ```

### 3. Verify Deployment

1. Visit your domain in a browser
2. Check that:
   - The application loads without errors
   - Navigation works correctly (SPA routing)
   - API calls work (if backend is deployed)
   - All assets load properly

## Important Notes

### Frontend vs Backend
This deployment guide is for the **frontend only**. The EarthForUs application consists of:
- **Frontend:** React application (what you're deploying)
- **Backend:** Node.js/Express API server (requires separate hosting)

### Backend Deployment
For the backend API server, you'll need:
- Node.js hosting (VPS, cloud hosting, or Node.js-specific hosting)
- PostgreSQL database
- Environment variables for database connection

### Common Issues

1. **404 errors on page refresh:** Make sure `.htaccess` file is uploaded and working
2. **API calls failing:** Update `VITE_API_BASE` environment variable with correct backend URL
3. **Assets not loading:** Check that `base: './'` is set in `vite.config.ts`

### Security Recommendations

1. **HTTPS:** Always use HTTPS in production
2. **API Security:** Implement proper CORS and authentication
3. **Database:** Use SSL connections for database (set `PG_SSL_MODE=require`)
4. **Secrets:** Never commit sensitive data to version control

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Hostinger error logs
4. Ensure all files are uploaded correctly