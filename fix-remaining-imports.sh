#!/bin/bash

# Script to fix broken import syntax in remaining files

echo "🔧 Fixing broken import syntax in remaining files..."

# Function to fix a single file
fix_file() {
  local file="$1"
  
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix the broken import syntax
    # Replace "import * as React\nimport" with "import * as React from 'react';\nimport"
    sed -i '' '1s/^import \* as React$/import * as React from '"'"'react'"'"';/' "$file"
    
    echo "✅ Fixed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
}

# List of files that need fixing
files=(
  "src/components/AvatarMenuDropdown/AvatarMenuDropdown.tsx"
  "src/components/Layout/Header.tsx"
  "src/components/Layout/Footer.tsx"
  "src/features/auth/pages/LoginPage.tsx"
  "src/features/auth/pages/SignupPage.tsx"
  "src/features/events/components/EventMap.tsx"
  "src/features/events/components/ChatComponent.tsx"
  "src/features/events/components/TodoListComponent.tsx"
  "src/features/events/pages/EventsPage.tsx"
  "src/features/events/pages/EventPage.tsx"
  "src/features/events/pages/CreateEventPage.tsx"
  "src/features/profile/pages/ProfilePage.tsx"
  "src/features/settings/pages/SettingsPage.tsx"
  "src/features/landing/pages/LandingPage.tsx"
  "src/shared/components/DateTimeField.tsx"
  "src/shared/components/NumberField.tsx"
  "src/shared/components/Textarea.tsx"
  "src/shared/components/Toast.tsx"
  "src/shared/theme/ThemeContext.tsx"
  "src/app/layout/Layout.tsx"
)

# Process each file
for file in "${files[@]}"; do
  fix_file "$file"
done

echo "🎉 Import syntax fixes completed!"
echo "🔍 Please review the changes and test thoroughly"