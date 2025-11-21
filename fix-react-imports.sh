#!/bin/bash

# Script to fix React import issues across the codebase
# This script converts `import React from 'react'` to `import * as React from 'react'`

echo "🔧 Fixing React import issues..."

# Find all TypeScript/TSX files with problematic React imports
echo "📁 Searching for files with React import issues..."

# Files that need React import fixes
files=(
  "src/features/auth/pages/LoginPage.tsx"
  "src/features/auth/pages/SignupPage.tsx"
  "src/features/auth/components/ProtectedRoute.tsx"
  "src/features/home/pages/HomePage.tsx"
  "src/features/events/components/EventMap.tsx"
  "src/features/events/components/ChatComponent.tsx"
  "src/features/events/pages/EventsPage.tsx"
  "src/features/events/pages/EventPage.tsx"
  "src/features/events/pages/CreateEventPage.tsx"
  "src/features/events/components/TodoListComponent.tsx"
  "src/features/profile/pages/ProfilePage.tsx"
  "src/features/settings/pages/SettingsPage.tsx"
  "src/features/landing/pages/LandingPage.tsx"
  "src/shared/components/DateTimeField.tsx"
  "src/shared/components/NumberField.tsx"
  "src/shared/components/Textarea.tsx"
  "src/shared/components/Toast.tsx"
  "src/components/Common/LoadingSpinner.tsx"
  "src/components/AvatarMenuDropdown/AvatarMenuDropdown.tsx"
  "src/components/Layout/Header.tsx"
  "src/components/Layout/Footer.tsx"
  "src/app/layout/Layout.tsx"
)

# Fix each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Fix React imports
    sed -i '' 's/import React,/import * as React,/' "$file"
    sed -i '' 's/import React from/import * as React from/' "$file"
    sed -i '' 's/import React$/import * as React/' "$file"
    
    echo "✅ Fixed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

# Fix server-side import issues
echo "🔧 Fixing server-side import issues..."

# Fix bcrypt imports in server files
server_files=(
  "src/server/api/routes/auth.ts"
  "src/server/api/routes/users.ts"
)

for file in "${server_files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing server file: $file"
    cp "$file" "$file.bak"
    sed -i '' 's/import bcrypt from/import * as bcrypt from/' "$file"
    echo "✅ Fixed server imports: $file"
  else
    echo "⚠️  Server file not found: $file"
  fi
done

echo "🎉 React import fixes completed!"
echo "📝 Backup files created with .bak extension"
echo "🔍 Please review the changes and remove backup files when satisfied"