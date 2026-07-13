#!/bin/bash
set -e
cd /opt/portfolio

if [ ! -f .env.local ]; then
  echo "缺少 .env.local，请先复制 .env.local.example 并填写"
  exit 1
fi

git pull
npm ci
node scripts/setup.cjs
npm run build
pm2 restart portfolio || pm2 start ecosystem.config.cjs
pm2 save

sleep 3
curl -sf http://localhost:3000/api/health > /dev/null || { echo "Health check failed!"; exit 1; }
echo "Deploy complete. 首次部署后请登录 /admin 并在设置页重建 AI 索引。"
