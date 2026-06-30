#!/bin/bash
set -e
cd /opt/portfolio
git pull
npm ci
npm run build
pm2 restart portfolio || pm2 start ecosystem.config.cjs
pm2 save
echo "Deploy complete."
