#!/bin/bash

# Script to fix import.meta.env issues across the codebase
# This script replaces import.meta.env with safer alternatives

echo "🔧 Fixing import.meta.env issues..."

# Files that need import.meta.env fixes
files=(
  "src/shared/utils/logger.ts"
  "src/shared/utils/security.ts"
  "src/shared/utils/environment.ts"
  "src/features/auth/pages/LoginPage.tsx"
  "src/features/events/components/ChatComponent.tsx"
)

# Function to safely replace import.meta.env
fix_import_meta_env() {
  local file="$1"
  
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace import.meta.env with safe alternatives
    # Pattern 1: Direct property access
    sed -i '' 's/(import\.meta as any)\.env\./process.env./g' "$file"
    sed -i '' 's/import\.meta\.env\./process.env./g' "$file"
    
    # Pattern 2: With optional chaining
    sed -i '' 's/(import\.meta as any)\?\.env\?\./process.env./g' "$file"
    sed -i '' 's/import\.meta\?\.env\?\./process.env./g' "$file"
    
    # Pattern 3: File URL imports (keep these but make them conditional)
    if grep -q "import.meta.url" "$file"; then
      echo "⚠️  Found import.meta.url in $file - manual review needed"
    fi
    
    echo "✅ Fixed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
}

# Process each file
for file in "${files[@]}"; do
  fix_import_meta_env "$file"
done

echo "🎉 import.meta.env fixes completed!"
echo "📝 Backup files created with .bak extension"
echo "🔍 Please review the changes and test thoroughly"
echo "⚠️  Files with import.meta.url need manual review"