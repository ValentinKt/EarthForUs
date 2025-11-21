#!/bin/bash

# Comprehensive script to fix all TypeScript import issues

echo "🔧 Comprehensive TypeScript Import Fix"
echo "======================================="

# Function to fix React imports in a file
fix_react_imports() {
  local file="$1"
  
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Read the file and fix imports
    awk '
    BEGIN { fixed = 0 }
    {
      # Fix React imports
      if ($0 ~ /^import React,/) {
        # Split the import into separate lines
        split($0, parts, /,/)
        print "import * as React from '"'"'react'"'"';"
        for (i = 2; i <= length(parts); i++) {
          gsub(/^[[:space:]]*/, "", parts[i])
          gsub(/[[:space:]]*$/, "", parts[i])
          if (parts[i] ~ /}/) {
            print "import {" parts[i]
          } else if (parts[i] ~ /from/) {
            print "import " parts[i]
          } else {
            print "import {" parts[i] "} from '"'"'react'"'"';"
          }
        }
        fixed = 1
      }
      else if ($0 ~ /^import React from/) {
        print "import * as React from '"'"'react'"'"';"
        fixed = 1
      }
      else {
        print $0
      }
    }
    ' "$file.backup" > "$file"
    
    echo "✅ Fixed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
}

# Function to fix import.meta.env issues
fix_import_meta() {
  local file="$1"
  
  if [ -f "$file" ]; then
    echo "🌍 Processing import.meta.env: $file"
    
    # Create backup if not exists
    if [ ! -f "$file.backup" ]; then
      cp "$file" "$file.backup"
    fi
    
    # Replace import.meta.env with process.env
    sed -i '' 's/(import\.meta as any)\.env\./process.env./g' "$file"
    sed -i '' 's/import\.meta\.env\./process.env./g' "$file"
    sed -i '' 's/(import\.meta as any)\?\.env\?\./process.env./g' "$file"
    sed -i '' 's/import\.meta\?\.env\?\./process.env./g' "$file"
    
    echo "✅ Fixed import.meta.env: $file"
  fi
}

# Function to fix bcrypt imports
fix_bcrypt_imports() {
  local file="$1"
  
  if [ -f "$file" ]; then
    echo "🔐 Processing bcrypt imports: $file"
    
    # Create backup if not exists
    if [ ! -f "$file.backup" ]; then
      cp "$file" "$file.backup"
    fi
    
    # Fix bcrypt imports
    sed -i '' 's/import bcrypt from/import * as bcrypt from/' "$file"
    
    echo "✅ Fixed bcrypt imports: $file"
  fi
}

# List of files that need React import fixes
react_files=(
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

# Files that need import.meta.env fixes
meta_files=(
  "src/shared/utils/logger.ts"
  "src/shared/utils/security.ts"
  "src/shared/utils/environment.ts"
  "src/features/auth/pages/LoginPage.tsx"
  "src/features/events/components/ChatComponent.tsx"
)

# Files that need bcrypt fixes
bcrypt_files=(
  "src/server/api/routes/auth.ts"
  "src/server/api/routes/users.ts"
)

# Process React imports
echo "🔧 Fixing React imports..."
for file in "${react_files[@]}"; do
  fix_react_imports "$file"
done

# Process import.meta.env
echo ""
echo "🌍 Fixing import.meta.env..."
for file in "${meta_files[@]}"; do
  fix_import_meta "$file"
done

# Process bcrypt imports
echo ""
echo "🔐 Fixing bcrypt imports..."
for file in "${bcrypt_files[@]}"; do
  fix_bcrypt_imports "$file"
done

echo ""
echo "🎉 All import fixes completed!"
echo "📁 Backup files created with .backup extension"
echo "🔍 Please review the changes and test thoroughly"
echo ""
echo "Next steps:"
echo "1. Run: npm run test:coverage"
echo "2. Review any remaining compilation errors"
echo "3. Remove backup files when satisfied: find . -name '*.backup' -delete"