#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Hostinger Deployment Script
 * Supports both production and development environments with optimized logging
 */

class DeploymentManager {
  constructor(environment) {
    this.environment = environment.toUpperCase();
    this.startTime = Date.now();
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    };
    
    this.isProduction = this.environment === 'PROD';
    this.logLevel = this.isProduction ? 'ERROR' : 'INFO';
  }

  log(level, message, context = '') {
    const timestamp = new Date().toISOString();
    const envTag = this.isProduction ? 'PROD' : 'DEV';
    const color = this.getColorForLevel(level);
    const logMessage = `${this.colors.cyan}[${timestamp}]${this.colors.reset} ${this.colors.bright}${color}[${envTag}][${level}]${this.colors.reset} ${message}${context ? ` ${this.colors.yellow}(${context})${this.colors.reset}` : ''}`;
    
    console.log(logMessage);
  }

  getColorForLevel(level) {
    switch (level) {
      case 'ERROR': return this.colors.red;
      case 'WARN': return this.colors.yellow;
      case 'SUCCESS': return this.colors.green;
      case 'INFO': return this.colors.blue;
      default: return this.colors.reset;
    }
  }

  validateEnvironment() {
    this.log('INFO', 'Validating environment...', 'Environment Check');
    
    if (!['PROD', 'DEV'].includes(this.environment)) {
      this.log('ERROR', `Invalid environment: ${this.environment}. Must be PROD or DEV.`, 'Validation');
      process.exit(1);
    }

    this.log('SUCCESS', `Environment validated: ${this.environment}`, 'Validation');
  }

  async validateProductionRequirements() {
    if (!this.isProduction) return;

    this.log('INFO', 'Running production security checks...', 'Security');

    try {
      // Import security validator
      const { createSecurityValidator } = await import('../src/shared/utils/security.ts');
      const validator = createSecurityValidator(true);
      
      const isValid = await validator.validateAll();
      if (!isValid) {
        this.log('ERROR', 'Security validation failed', 'Security');
        process.exit(1);
      }

      this.log('SUCCESS', 'Production security checks passed', 'Security');
    } catch (error) {
      // Fallback to basic security checks if TypeScript import fails
      this.log('WARN', 'Advanced security validator not available, using basic checks', 'Security');
      
      // Basic security checks
      if (!fs.existsSync('.env.production')) {
        this.log('ERROR', 'Missing .env.production file', 'Security');
        process.exit(1);
      }

      const envContent = fs.readFileSync('.env.production', 'utf8');
      if (!envContent.includes('VITE_API_BASE=') || envContent.includes('VITE_API_BASE=http://localhost')) {
        this.log('ERROR', 'Invalid production API configuration', 'Security');
        process.exit(1);
      }

      this.log('SUCCESS', 'Basic production security checks passed', 'Security');
    }
  }

  getAllFiles(dir, extension) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath, extension));
      } else if (path.extname(item) === extension) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  setupEnvironment() {
    this.log('INFO', 'Setting up environment configuration...', 'Setup');

    // Set environment-specific variables
    process.env.NODE_ENV = this.isProduction ? 'production' : 'development';
    process.env.VITE_LOG_LEVEL = this.logLevel;

    // Copy appropriate environment file
    const envFile = this.isProduction ? '.env.production' : '.env.development';
    const targetFile = '.env';

    if (fs.existsSync(envFile)) {
      fs.copyFileSync(envFile, targetFile);
      this.log('SUCCESS', `Environment file copied: ${envFile} -> ${targetFile}`, 'Setup');
    } else {
      this.log('WARN', `Environment file not found: ${envFile}`, 'Setup');
    }
  }

  buildApplication() {
    this.log('INFO', 'Building application...', 'Build');

    try {
      // Clean previous build
      if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
        this.log('INFO', 'Cleaned previous build', 'Build');
      }

      // Run build command
      execSync('npm run build', { stdio: 'pipe' });
      this.log('SUCCESS', 'Build completed successfully', 'Build');

    } catch (error) {
      this.log('ERROR', `Build failed: ${error.message}`, 'Build');
      process.exit(1);
    }
  }

  prepareDeploymentFiles() {
    this.log('INFO', 'Preparing deployment files...', 'Deployment');

    try {
      // Copy .htaccess to dist folder
      if (fs.existsSync('.htaccess')) {
        fs.copyFileSync('.htaccess', 'dist/.htaccess');
        this.log('SUCCESS', 'Copied .htaccess to dist folder', 'Deployment');
      }

      // Create deployment manifest
      const manifest = {
        environment: this.environment,
        timestamp: new Date().toISOString(),
        version: this.getPackageVersion(),
        buildTime: Date.now() - this.startTime,
        files: this.getDeploymentFiles()
      };

      fs.writeFileSync('dist/deployment-manifest.json', JSON.stringify(manifest, null, 2));
      this.log('SUCCESS', 'Created deployment manifest', 'Deployment');

    } catch (error) {
      this.log('ERROR', `Failed to prepare deployment files: ${error.message}`, 'Deployment');
      process.exit(1);
    }
  }

  getPackageVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  getDeploymentFiles() {
    const distPath = path.join(__dirname, '../dist');
    const files = [];
    
    if (fs.existsSync(distPath)) {
      const allFiles = this.getAllFiles(distPath, '');
      allFiles.forEach(file => {
        const relativePath = path.relative(distPath, file);
        const stats = fs.statSync(file);
        files.push({
          path: relativePath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      });
    }
    
    return files;
  }

  validateBuild() {
    this.log('INFO', 'Validating build...', 'Validation');

    const requiredFiles = ['index.html', '.htaccess'];
    const distPath = 'dist';

    requiredFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      if (!fs.existsSync(filePath)) {
        this.log('ERROR', `Missing required file: ${file}`, 'Validation');
        process.exit(1);
      }
    });

    // Validate index.html
    const indexPath = path.join(distPath, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (!indexContent.includes('<div id="root"></div>')) {
      this.log('ERROR', 'Invalid index.html structure', 'Validation');
      process.exit(1);
    }

    this.log('SUCCESS', 'Build validation completed', 'Validation');
  }

  generateDeploymentReport() {
    const duration = Date.now() - this.startTime;
    const fileCount = this.getDeploymentFiles().length;

    this.log('SUCCESS', 'Deployment preparation completed!', 'Complete');
    this.log('INFO', `Environment: ${this.environment}`, 'Summary');
    this.log('INFO', `Duration: ${duration}ms`, 'Summary');
    this.log('INFO', `Files prepared: ${fileCount}`, 'Summary');
    this.log('INFO', 'Ready for Hostinger upload', 'Summary');

    console.log('\n' + this.colors.cyan + this.colors.bright + '🚀 DEPLOYMENT READY!' + this.colors.reset);
    console.log(this.colors.green + 'Next steps:' + this.colors.reset);
    console.log('1. Upload the contents of the \'dist\' folder to your Hostinger server');
    console.log('2. Ensure your backend API is properly configured');
    console.log('3. Test the deployment in your target environment');
    
    if (this.isProduction) {
      console.log(this.colors.yellow + '\n⚠️  PRODUCTION DEPLOYMENT:' + this.colors.reset);
      console.log('- Verify SSL certificates are properly configured');
      console.log('- Test all API endpoints before going live');
      console.log('- Monitor application logs for any issues');
    }
  }

  async deploy() {
    try {
      this.log('INFO', 'Starting deployment process...', 'Init');
      
      this.validateEnvironment();
      await this.validateProductionRequirements();
      this.setupEnvironment();
      this.buildApplication();
      this.prepareDeploymentFiles();
      this.validateBuild();
      this.generateDeploymentReport();

    } catch (error) {
      this.log('ERROR', `Deployment failed: ${error.message}`, 'Fatal');
      process.exit(1);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const environment = process.argv[2] || 'DEV';
  const deployment = new DeploymentManager(environment);
  deployment.deploy();
}

export default DeploymentManager;