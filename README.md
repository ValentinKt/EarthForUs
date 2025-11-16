# EarthForUs - Environmental Volunteering Platform

EarthForUs is a modern web application that connects environmentally conscious individuals with local volunteering opportunities. The platform enables users to discover, create, and participate in environmental events while fostering community engagement.

## 🌍 Project Overview

EarthForUs is built as a full-stack React application with a Node.js/Express backend, designed for deployment on Hostinger shared hosting. The platform features event management, user profiles, interactive maps, and comprehensive authentication systems.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/signup with protected routes
- **Event Management**: Create, discover, and manage environmental events
- **Interactive Maps**: Location-based event discovery with Leaflet integration
- **User Profiles**: Personal dashboards with event participation tracking
- **Responsive Design**: Mobile-first approach with modern UI/UX

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **Modern React**: Hooks, context, and functional components
- **Security**: Comprehensive validation and security checks
- **Logging**: Structured logging system for debugging and monitoring
- **Deployment Ready**: Automated deployment scripts for Hostinger

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for modern styling
- **React Router v6** - Client-side routing with nested routes
- **Leaflet** - Interactive maps for location-based features
- **React Hook Form** - Efficient form handling and validation

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework for REST APIs
- **TypeScript** - Type-safe backend development
- **PostgreSQL** - Relational database for data persistence
- **JWT** - JSON Web Tokens for secure authentication
- **CORS** - Cross-origin resource sharing configuration
- **Helmet** - Security middleware for HTTP headers

### Development Tools
- **ESLint** - Code linting for consistent code quality
- **Prettier** - Code formatting for clean, readable code
- **Git** - Version control with comprehensive commit history
- **NPM Scripts** - Automated build and deployment processes

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git** for version control
- **PostgreSQL** (for local development)
- **Hostinger Account** (for deployment)

## 🏃‍♂️ Running the Project Locally

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd EarthForUs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
# Copy environment template
cp .env.example .env.development

# Edit .env.development with your local configuration
```

### 4. Configure Database (Optional for Frontend Development)
```bash
# Set up PostgreSQL database
# Update DATABASE_URL in .env.development
```

### 5. Run Development Server
```bash
# Start frontend development server
npm run dev

# Application will be available at: http://localhost:5173
```

### 6. Run Backend Server (If Using Full Stack)
```bash
# Start backend development server
npm run dev:server

# API will be available at: http://localhost:3000/api
```

## 📦 Available Commands

### Development Commands
```bash
npm run dev          # Start frontend development server
npm run dev:server   # Start backend development server
npm run build        # Build production frontend
npm run build:server # Build production backend
npm run preview      # Preview production build locally
```

### Code Quality Commands
```bash
npm run lint         # Run ESLint for code quality
npm run lint:fix     # Fix ESLint issues automatically
npm run type-check   # Run TypeScript type checking
```

### Deployment Commands
```bash
npm run deploy:dev   # Prepare development deployment
npm run deploy:prod  # Prepare production deployment with security checks
```

## 🚀 Deployment to Hostinger

EarthForUs includes an automated deployment system with comprehensive security validation for production deployments.

### Development Deployment
```bash
# Prepare development build
npm run deploy:dev

# Upload contents of 'dist' folder to Hostinger
# Set environment variables in Hostinger control panel
```

### Production Deployment
```bash
# Prepare production build with security validation
npm run deploy:prod

# Upload contents of 'dist' folder to Hostinger
# Set production environment variables
```

### Hostinger Environment Variables
Configure these in your Hostinger control panel under "Environment Variables":

```bash
# Required Variables
VITE_API_BASE=https://your-api-domain.com/api
VITE_LOG_LEVEL=info
VITE_ENVIRONMENT=production

# Optional Variables
VITE_ENABLE_DEBUG=false
VITE_ALLOW_CONSOLE_LOGS=false
```

### Deployment Features
- **Automated Build Process**: Creates optimized production builds
- **Security Validation**: Comprehensive checks for production deployments
- **Environment-Specific Configs**: Separate development and production settings
- **SPA Routing Support**: Includes `.htaccess` for proper routing
- **Deployment Manifest**: Generates deployment information

## 📁 Project Structure

```
EarthForUs/
├── src/
│   ├── components/       # Reusable React components
│   ├── features/        # Feature-specific components
│   ├── shared/          # Shared utilities and components
│   ├── server/          # Backend API routes and logic
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── scripts/             # Deployment and build scripts
├── dist/                # Production build output
└── docs/                # Documentation and prototypes
```

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
- Build optimization for Hostinger deployment
- Path aliases for clean imports
- Environment variable handling

### TypeScript Configuration
- `tsconfig.json` - Base TypeScript configuration
- `tsconfig.app.json` - Frontend-specific settings
- `tsconfig.server.json` - Backend-specific settings

### Environment Files
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables
- `.env.example` - Template for environment setup

## 🔒 Security Features

### Authentication
- JWT-based authentication with secure token handling
- Protected routes with automatic redirects
- Session management and token refresh

### Production Security
- HTTPS enforcement for API endpoints
- Test credential removal validation
- Debug mode disabled in production
- Console log scanning and warnings
- Environment-specific security rules

### Data Protection
- Environment variables for sensitive configuration
- Secure password handling
- CORS configuration for API security

## 🗺️ Interactive Maps

The application uses Leaflet for interactive maps:
- Event location visualization
- Radius-based search areas
- Responsive map components
- Geocoding for address-to-coordinate conversion

## 📝 Logging System

Comprehensive logging throughout the application:
- Structured logging with timestamps
- Environment-specific log levels
- Error tracking and debugging support
- API request/response logging

## 🧪 Testing

### Manual Testing
- Authentication flow testing
- Event creation and management
- Map functionality verification
- Responsive design testing

### Deployment Testing
- Local build verification
- Environment variable validation
- Security check validation
- Hostinger deployment testing

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
- Check TypeScript errors: `npm run type-check`
- Verify environment variables are set
- Ensure all dependencies are installed

**Deployment Issues**
- Verify `.htaccess` file is uploaded
- Check environment variables in Hostinger
- Ensure API endpoints are accessible

**Map Loading Issues**
- Verify Leaflet CSS is imported
- Check for CORS issues with map tiles
- Ensure proper map container sizing

### Debug Mode
Enable debug logging by setting:
```bash
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and create a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the deployment documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
3. Check browser console for client-side errors
4. Verify API connectivity and backend status
5. Consult Hostinger documentation for hosting-specific issues

## 🎯 Roadmap

- [ ] Mobile application development
- [ ] Advanced event filtering and search
- [ ] Social features and user interactions
- [ ] Admin dashboard for event management
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Event rating and review system

---

**EarthForUs** - Connecting people with the planet, one volunteer opportunity at a time 🌱