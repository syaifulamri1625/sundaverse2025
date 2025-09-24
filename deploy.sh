#!/bin/bash
# deploy.sh — Automate GitHub + Vercel deployment for Sunda Immersive v4

set -e

# === CONFIG ===
REPO_NAME="sunda-immersive-v4"
GITHUB_USER="your-github-username"
VERCEL_PROJECT="sunda-immersive-v4"

# === STEP 1: Init Git and Push to GitHub ===
if [ ! -d .git ]; then
  echo "👉 Init git repo"
  git init
  git branch -m main
fi

echo "👉 Adding files and committing"
git add .
git commit -m "Deploy Sunda Immersive v4" || echo "⚠️ Nothing to commit"

if ! git remote | grep origin; then
  echo "👉 Adding GitHub remote"
  git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
fi

echo "👉 Pushing to GitHub"
git push -u origin main

# === STEP 2: Deploy to Vercel ===
echo "👉 Deploying to Vercel"
if ! command -v vercel &> /dev/null; then
  echo "⚠️ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# Make sure env vars exist
if [ ! -f .env ]; then
  echo "⚠️ Please create .env file with your keys (see .env.example)"
  exit 1
fi

# Link project if not linked
if [ ! -f .vercel/project.json ]; then
  vercel link --project $VERCEL_PROJECT --confirm
fi

# Push env vars from .env to Vercel
while IFS= read -r line; do
  if [[ "$line" == \#* ]] || [[ -z "$line" ]]; then continue; fi
  key=$(echo "$line" | cut -d '=' -f 1)
  val=$(echo "$line" | cut -d '=' -f 2-)
  echo "👉 Setting Vercel env: $key"
  vercel env add $key production <<< "$val"
done < .env

# Deploy
vercel --prod --confirm

echo "✅ Deployment complete!"
