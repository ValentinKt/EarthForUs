# EarthForUs Project TODO

[x] Switch Tailwind brand palette to teal
[x] Update auth pages background to brand-50
[x] Update .gitignore to ignore .data/ and .env; untrack them
[x] Commit styling and gitignore changes

[x] Create AuthContext with provider and useAuth hook
[x] Add ProtectedRoute component for authentication guarding
[x] Wrap protected routes in App with ProtectedRoute
[x] Update Layout header to show Logout when authenticated
[x] Change Layout background to brand-50
[x] Commit auth guard and layout changes
[x] Preview app to validate auth flow and styling

[x] Port avatar menu prototype to React and wire auth/logout
[x] Use AvatarMenuDropdown in header when authenticated
[x] Redesign CreateEventPage to match prototype style and UX
[x] Commit avatar/layout and event page changes
[x] Preview app to verify dropdown and event creation UI
[x] Implement shared logger utility
[x] Integrate logging into CreateEventPage
[x] Enhance CreateEventPage with validation, accessibility, keyboard support
[x] Add logging to AvatarMenuDropdown interactions
[x] Preview app to validate logging and UX
[x] Add logging to AuthProvider and ProtectedRoute
[x] Unify Add Tool button using shared Button
[x] Create shared accessible form input components
[x] Refactor CreateEventPage to use shared inputs and polish layout
[x] Implement Toast system; wrap App with provider; use in CreateEventPage
[x] Add route change logging in App
[x] Add structured logging to events API routes
[x] Preview app to check UI changes and logging
[x] Instrument ErrorBoundary with structured logging
[x] Make TextField and Textarea labels optional
[x] Add structured logging to EventsPage data fetching
[x] Implement shared API client with logging and timing
[x] Refactor EventsPage to use API client; add loading/error toast; Link

[x] Fix login redirect loop by using AuthContext.login in LoginPage
[x] Implement test credentials panel on LoginPage driven by env variables
[x] Create HomePage with modern hero and CTAs
[x] Create EventsPage with modern card grid, loading/error/empty states
[x] Create ProfilePage showing user info and account actions
[x] Refactor App.tsx routes to use new pages
[x] Preview UI across Home, Events, and Profile
[x] Implement EventPage with modern details UI and tabs
[x] Wire /events/:id route and update EventsPage card links
[x] Preview Events list and Event details navigation

[x] Install Leaflet and React-Leaflet dependencies
[x] Import Leaflet CSS globally in src/main.tsx
[x] Create EventMap component with marker and radius overlay
[x] Implement address geocoding and robust error handling
[x] Integrate EventMap into EventPage (Map tab)
[x] Preview and validate map responsiveness and interactions

[x] Install @types/leaflet and adjust EventMap typings
[x] Resolve TypeScript diagnostics in EventMap, App, Layout, AvatarMenuDropdown, and logger

[x] Configure vite.config.ts for Hostinger deployment with relative base path
[x] Create .htaccess file for SPA routing on Apache server
[x] Create .env.production template for production environment variables
[x] Create comprehensive DEPLOYMENT.md guide for Hostinger
[x] Build production-ready dist folder with all deployment files
[x] Create comprehensive deployment documentation with security features and troubleshooting
[x] Create comprehensive README.md with project overview, technologies, and deployment instructions

[x] Create ChatComponent for event-specific chat functionality
[x] Create TodoListComponent for event-specific todo/checklist functionality
[x] Update EventPage to integrate new chat and todo components
[x] Create API endpoints for chat messages and todo items
[x] Add real-time functionality to chat using WebSocket or polling

[x] Enhance CreateEventPage validation and duplicate prevention
[x] Optimize TodoListComponent performance with memoization and stable callbacks
[x] Add local tags/categories and caching to TodoListComponent
[x] Implement due date reminders and overdue indicators
[ ] Add unit and integration tests for event creation and todo list
[x] Start dev server and preview UI changes
[x] Fix events listing API to handle legacy DB columns (start/end)
[x] Restart API server and verify UI shows events without schema errors
[x] Add legacy fallback for event creation and duplicate checks
[x] Restart API and verify no schema errors on create/list

[x] Implement Settings page with profile and password forms
[x] Replace placeholder Settings route with new page
[x] Create users API routes for profile and password update
[x] Mount users routes in API server
[x] Restart API and run dev server; open preview to verify[x] Enhance Edit Account UI/UX with modern layout and spacing
[x] Add clear labels, helper text, and field instructions
[x] Implement responsive form layout across mobile, tablet, desktop
[x] Add real-time validation with inline, helpful error messages
[x] Add visual feedback: loading states, success and error toasts
[x] Ensure consistent styling with app theme and Button variants
[x] Group related account settings for logical navigation
[x] Improve accessibility: ARIA labels, aria-live, keyboard navigation, contrast
[x] Add password strength indicator and visibility toggles
[x] Verify Settings page in dev preview and interactions
[x] Ensure events table has modern columns start_time/end_time in DB
[x] Add npm script db:fix-events to run column fix
[x] Restart API and verify Events page loads without 500 errors

[x] Implement ThemeProvider with system detection and persistence
[x] Wrap App with ThemeProvider to enable global dark mode
[x] Standardize input styles with .ui-input and .ui-checkbox
[x] Refactor shared inputs to use .ui-input (TextField, NumberField, Textarea, DateTimeField)
[x] Update Login and Signup pages to use .ui-input with ARIA improvements
[x] Add Appearance settings in Settings with light/dark/system radios
[x] Open preview to verify dark mode toggles and persistence
