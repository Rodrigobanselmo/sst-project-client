# Environment Setup Guide for SST Project

This guide helps resolve the "Cannot find module" error when running `yarn dev`.

## The Problem

The error indicates that compiled JavaScript files in `dist/` are trying to import from `src/` directory. This typically happens due to:

- Stale/corrupted build artifacts in the `dist/` folder
- Cached TypeScript build info
- Path resolution issues between different environments

## Solution Steps

### Step 1: Clean Build Artifacts (MOST IMPORTANT)

```bash
# Navigate to the API project
cd sst-project-api

# Remove dist folder completely
rm -rf dist

# Remove TypeScript incremental build cache
rm -rf .tsbuildinfo
rm -rf dist/.tsbuildinfo

# Remove node_modules/.cache if it exists
rm -rf node_modules/.cache
```

### Step 2: Reinstall Dependencies

```bash
# Remove node_modules
rm -rf node_modules

# Clear yarn cache (optional but recommended)
yarn cache clean

# Reinstall all dependencies
yarn install
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Run Fresh Build

```bash
# Run a fresh build first (this ensures clean compilation)
yarn build

# Then start dev server
yarn dev
```

## Required Environment

### Node.js Version

- **Required:** Node.js v22.x (see package.json `"engines": { "node": "22" }`)
- Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:

```bash
# Install Node 22
nvm install 22

# Use Node 22
nvm use 22

# Verify version
node -v  # Should show v22.x.x
```

### Package Manager

- **Required:** Yarn (v1.22.x)

```bash
# Check yarn version
yarn -v

# If not installed
npm install -g yarn
```

### Required System Tools

#### macOS

```bash
# Install Xcode Command Line Tools (if not installed)
xcode-select --install

# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Full Clean Setup Script

Create this script or run these commands in order:

```bash
#!/bin/bash
# Full clean setup for sst-project-api

cd ~/Desktop/Programação/sst-project-api  # Adjust path as needed

# 1. Clean everything
rm -rf dist
rm -rf node_modules
rm -rf .tsbuildinfo
rm -rf node_modules/.cache

# 2. Install dependencies fresh
yarn install

# 3. Generate Prisma client
npx prisma generate

# 4. Build first
yarn build

# 5. Start dev server
yarn dev
```

## Common Issues & Solutions

### Issue: File descriptor limit errors

The project already handles this with `./scripts/increase-limits.sh`. Make sure this script exists and is executable:

```bash
chmod +x ./scripts/increase-limits.sh
```

### Issue: Prisma client not generated

```bash
npx prisma generate
```

### Issue: Case sensitivity problems

macOS is case-insensitive by default. Check if any imports have wrong casing:

```bash
# Search for the problematic file
find src -name "checklist.entity*" -type f
```

### Issue: Path aliases not resolving

Ensure `tsconfig.json` paths match your project structure:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*", "test/*"],
      "@v2": ["src/@v2/*"]
    },
    "baseUrl": "./"
  }
}
```

## Environment Variables

Make sure you have a `.env` file with all required variables. Copy from example if available:

```bash
cp .env.example .env
# Edit .env with your values
```

## Verification Steps

After setup, verify everything works:

```bash
# 1. Check Node version
node -v  # Should be v22.x.x

# 2. Check yarn
yarn -v

# 3. Build should complete without errors
yarn build

# 4. Dev server should start
yarn dev
```

## Quick Fix Commands (TL;DR)

```bash
rm -rf dist node_modules .tsbuildinfo
yarn install
npx prisma generate
yarn build
yarn dev
```

---

## Advanced Troubleshooting: Swagger Plugin Issue

If you see an error like:

```
Error: Cannot find module '/Users/.../src/modules/sst/entities/checklist.entity'
```

The issue is that the compiled JS in `dist/` has paths pointing to `src/`. This is caused by the **@nestjs/swagger/plugin**.

### Diagnostic

Run this to confirm:

```bash
grep -n "src/modules" dist/modules/sst/controller/checklist/checklist.controller.js
```

If you see `src/modules` in the output, the Swagger plugin is generating absolute paths incorrectly.

### Solution 1: Disable Swagger Plugin Temporarily

Edit `nest-cli.json` and comment out the plugin:

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    // "plugins": ["@nestjs/swagger/plugin"],  <-- Comment this out
    "assets": [...]
  }
}
```

Then rebuild:

```bash
rm -rf dist
yarn build
yarn dev
```

### Solution 2: Check for Symlinks

Check if there are any symlinks in the project:

```bash
find . -type l -ls 2>/dev/null | grep -v node_modules
```

### Solution 3: Reinstall NestJS CLI Globally

```bash
npm uninstall -g @nestjs/cli
npm install -g @nestjs/cli@10.4.2
```

### Solution 4: Check Node.js Version

Ensure Node.js version matches exactly:

```bash
node -v  # Should be v22.x.x
```

Use nvm to switch versions:

```bash
nvm install 22
nvm use 22
```

---

If issues persist after all steps, try:

1. Clone the repository fresh
2. Follow setup steps from scratch
3. Compare Node.js and yarn versions with a working machine
