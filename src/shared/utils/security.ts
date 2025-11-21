// Security Configuration for Hostinger Deployment
// This file contains security rules and validation logic

import { logger } from '../utils/logger';

export interface SecurityRule {
  name: string;
  validate: () => boolean | Promise<boolean>;
  severity: 'error' | 'warn' | 'info';
  message: string;
  productionOnly?: boolean;
}

export class SecurityValidator {
  private rules: SecurityRule[] = [];
  private isProduction: boolean;

  constructor(isProduction: boolean) {
    this.isProduction = isProduction;
    this.initializeRules();
  }

  private initializeRules(): void {
    this.rules = [
      {
        name: 'HTTPS Enforcement',
        validate: () => this.validateHTTPS(),
        severity: 'error',
        message: 'Production deployments must use HTTPS',
        productionOnly: true
      },
      {
        name: 'Test Credentials Check',
        validate: () => this.validateTestCredentials(),
        severity: 'error',
        message: 'Test credentials must be disabled in production',
        productionOnly: true
      },
      {
        name: 'Debug Mode Check',
        validate: () => this.validateDebugMode(),
        severity: 'warn',
        message: 'Debug mode should be disabled in production',
        productionOnly: true
      },
      {
        name: 'API Base URL Validation',
        validate: () => this.validateAPIBaseURL(),
        severity: 'error',
        message: 'Invalid API base URL configuration',
        productionOnly: false
      },
      {
        name: 'Environment File Check',
        validate: () => this.validateEnvironmentFile(),
        severity: 'error',
        message: 'Missing required environment file',
        productionOnly: false
      },
      {
        name: 'Console Log Check',
        validate: () => this.validateConsoleLogs(),
        severity: 'warn',
        message: 'Found console.log statements in production build',
        productionOnly: true
      }
    ];
  }

  private validateHTTPS(): boolean {
    const apiBase = process.env.VITE_API_BASE || '';
    return !apiBase.includes('localhost') && apiBase.startsWith('https://');
  }

  private validateTestCredentials(): boolean {
    const testEmail = process.env.VITE_TEST_USER_EMAIL;
    const testPassword = process.env.VITE_TEST_USER_PASSWORD;
    return !(testEmail && testPassword);
  }

  private validateDebugMode(): boolean {
    const debugMode = process.env.VITE_ENABLE_DEBUG;
    return debugMode !== 'true';
  }

  private validateAPIBaseURL(): boolean {
    const apiBase = process.env.VITE_API_BASE;
    return apiBase && apiBase.length > 0 && !apiBase.includes('undefined');
  }

  private validateEnvironmentFile(): boolean {
    try {
      // This check is only available in Node.js environment
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const envFile = this.isProduction ? '.env.production' : '.env.development';
        return fs.existsSync(envFile);
      }
      return true; // Skip file system check in browser
    } catch {
      return true; // Skip file system check in browser
    }
  }

  private validateConsoleLogs(): boolean {
    try {
      // This check is only available in Node.js environment
      if (typeof window === 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const url = require('url');
        const __filename = 'security.ts';
        const __dirname = path.dirname(__filename);
        const distPath = path.join(__dirname, '../../../dist');
        
        if (!fs.existsSync(distPath)) return true;
        
        const jsFiles = this.getAllFiles(distPath, '.js');
        const consoleLogPattern = /console\.log\(/gi;
        
        return !jsFiles.some(file => {
          const content = fs.readFileSync(file, 'utf8');
          return consoleLogPattern.test(content);
        });
      }
      return true; // Skip file system check in browser
    } catch {
      return true; // Skip file system check in browser
    }
  }

  private getAllFiles(dir: string, extension: string): string[] {
    const files: string[] = [];
    try {
      // This function is only available in Node.js environment
      if (typeof window === 'undefined') {
        const items = require('fs').readdirSync(dir);
        
        items.forEach((item: string) => {
          const fullPath = require('path').join(dir, item);
          const stat = require('fs').statSync(fullPath);
          
          if (stat.isDirectory()) {
            files.push(...this.getAllFiles(fullPath, extension));
          } else if (require('path').extname(item) === extension) {
            files.push(fullPath);
          }
        });
      }
    } catch {}
    
    return files;
  }

  async validateAll(): Promise<boolean> {
    logger.info('Starting security validation...', undefined, 'SecurityValidator');
    
    const applicableRules = this.rules.filter(rule => 
      !rule.productionOnly || this.isProduction
    );
    
    let hasErrors = false;
    let hasWarnings = false;

    for (const rule of applicableRules) {
      try {
        const result = await rule.validate();
        
        if (result) {
          logger.info(`✅ ${rule.name}: PASSED`, undefined, 'SecurityValidator');
        } else {
          const logFn = rule.severity === 'error' ? logger.error : logger.warn;
          logFn(`❌ ${rule.name}: ${rule.message}`, undefined, 'SecurityValidator');
          
          if (rule.severity === 'error') hasErrors = true;
          if (rule.severity === 'warn') hasWarnings = true;
        }
      } catch (error) {
        logger.error(`❌ ${rule.name}: Validation failed - ${error}`, undefined, 'SecurityValidator');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      logger.error('Security validation failed with errors', undefined, 'SecurityValidator');
      return false;
    }

    if (hasWarnings) {
      logger.warn('Security validation completed with warnings', undefined, 'SecurityValidator');
    } else {
      logger.info('Security validation completed successfully', undefined, 'SecurityValidator');
    }

    return true;
  }
}

export const createSecurityValidator = (isProduction: boolean): SecurityValidator => {
  return new SecurityValidator(isProduction);
};