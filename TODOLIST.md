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