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