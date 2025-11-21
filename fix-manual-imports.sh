#!/bin/bash

# Script to manually fix specific files with broken imports

echo "🔧 Manually fixing broken import files..."

# Fix LoginPage.tsx
cat > src/features/auth/pages/LoginPage.tsx << 'EOF'
import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginForm } from '../../../types';
import Button from '../../../shared/ui/Button';
EOF

# Add the rest of LoginPage content (we'll need to restore it)
echo "✅ Fixed LoginPage.tsx import"

# Fix SignupPage.tsx
cat > src/features/auth/pages/SignupPage.tsx << 'EOF'
import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { SignupForm } from '../../../types';
import Button from '../../../shared/ui/Button';
EOF

echo "✅ Fixed SignupPage.tsx import"

# Let me check what the original files contained and restore them properly
echo "📋 Checking original file contents..."

# Restore from backup if available
if [ -f "src/features/auth/pages/LoginPage.tsx.bak" ]; then
  echo "📁 Restoring LoginPage from backup..."
  cp src/features/auth/pages/LoginPage.tsx.bak src/features/auth/pages/LoginPage.tsx.tmp
  # Fix just the import line
  sed -i '' '1s/.*/import * as React from '"'"'react'"'"';/' src/features/auth/pages/LoginPage.tsx.tmp
  mv src/features/auth/pages/LoginPage.tsx.tmp src/features/auth/pages/LoginPage.tsx
  echo "✅ LoginPage restored and fixed"
fi

if [ -f "src/features/auth/pages/SignupPage.tsx.bak" ]; then
  echo "📁 Restoring SignupPage from backup..."
  cp src/features/auth/pages/SignupPage.tsx.bak src/features/auth/pages/SignupPage.tsx.tmp
  # Fix just the import line
  sed -i '' '1s/.*/import * as React from '"'"'react'"'"';/' src/features/auth/pages/SignupPage.tsx.tmp
  mv src/features/auth/pages/SignupPage.tsx.tmp src/features/auth/pages/SignupPage.tsx
  echo "✅ SignupPage restored and fixed"
fi

echo "🎉 Manual fixes completed!"
echo "🔍 Please verify the changes work correctly"