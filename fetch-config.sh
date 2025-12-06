#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Ensure the GitHub URL is provided
if [ -z "$GITHUB_PAT" ]; then
  echo "Error: GITHUB_PAT is not set."
  exit 1
fi

SECRETS_GITHUB_REPO="https://${GITHUB_PAT}@github.com/tusharthakurepc1/secrets"

# Clone the repo, copy the config, and clean up
git clone "$SECRETS_GITHUB_REPO" /tmp/repo --depth=1

# Copy the prod config
cp /tmp/repo/mono-repo/backend/config.prod.json /app/src/config/config.prod.json
# Copy the nginx config to shared folder
# mkdir -p /app/shared
# cp /tmp/repo/mono-repo/nginx.conf /app/shared/nginx.conf

# Remove the secret cloned repo
rm -rf /tmp/repo

echo "Config successfully placed at /dist/src/config/config.prod.json"
