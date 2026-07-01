#!/bin/bash
set -e
cd /opt/portfolio
git pull
npm ci
npm run build
pm2 restart portfolio || pm2 start ecosystem.config.cjs
pm2 save
sleep 3
curl -sf http://localhost:3000 > /dev/null || { echo "Health check failed!"; exit 1; }
echo "Health check passed."
echo "Deploy complete."
