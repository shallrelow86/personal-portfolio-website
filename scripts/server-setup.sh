#!/bin/bash
set -e

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2
sudo npm install -g pm2

# Clone repo — replace with your actual repo URL
git clone <your-repo-url> /opt/portfolio
cd /opt/portfolio
npm ci

# Seed DB and get password hash
npx tsx scripts/seed.ts

# Build
npm run build

# Start
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Nginx
sudo cp nginx.conf /etc/nginx/sites-available/portfolio
sudo ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "Setup complete. Edit /etc/nginx/sites-available/portfolio to set your domain."
