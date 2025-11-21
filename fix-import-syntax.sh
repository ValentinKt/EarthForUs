#!/bin/bash

# Script to fix the broken React import syntax
# This script fixes the invalid "import * as React, { useState } from 'react'" pattern

echo "🔧 Fixing broken React import syntax..."

# Find all TypeScript/TSX files that might have the broken pattern
echo "📁 Searching for files with broken import syntax..."

# Use find to get all TS/TSX files and grep to find the broken pattern
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "import \* as React, {" "$file"; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak2"
    
    # Fix the broken import pattern
    # Replace "import * as React, { ... } from 'react'" with separate imports
    sed -i '' 's/import \* as React, { \([^}]*\) } from/import * as React\nimport { \1 } from/' "$file"
    
    echo "✅ Fixed: $file"
  fi
done

echo "🎉 React import syntax fixes completed!"
echo "📝 Backup files created with .bak2 extension"
echo "🔍 Please review the changes"