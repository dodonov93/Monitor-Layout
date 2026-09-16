#!/bin/bash
# VM Initial Setup Script for Oracle Cloud
# Run this after connecting to your fresh Oracle VM

set -e

echo "🚀 Starting Monitor Layout VM Setup..."
echo "=================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Configure firewall
echo "🔥 Configuring firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Install iptables-persistent
echo "💾 Installing iptables-persistent..."
echo iptables-persistent iptables-persistent/autosave_v4 boolean true | sudo debconf-set-selections
echo iptables-persistent iptables-persistent/autosave_v6 boolean true | sudo debconf-set-selections
sudo apt install -y iptables-persistent
sudo netfilter-persistent save

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Caddy
echo "🌐 Installing Caddy..."
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Install PM2
echo "⚙️  Installing PM2..."
sudo npm install -g pm2

# Install useful tools
echo "🛠️  Installing useful tools..."
sudo apt install -y htop curl wget git sqlite3 apache2-utils

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/monitor-layout
sudo chown ubuntu:ubuntu /opt/monitor-layout
mkdir -p /opt/monitor-layout/data
mkdir -p /opt/monitor-layout/logs
mkdir -p /opt/monitor-layout/backups

# Print versions
echo ""
echo "✅ Setup complete! Installed versions:"
echo "=================================="
node --version
npm --version
caddy version
pm2 --version
sqlite3 --version

echo ""
echo "📋 Next Steps:"
echo "1. Upload your application files to /opt/monitor-layout"
echo "2. Create .env.production file"
echo "3. Run: cd /opt/monitor-layout && npm install && npm run build"
echo "4. Configure Caddyfile: sudo nano /etc/caddy/Caddyfile"
echo "5. Start app with PM2: pm2 start ecosystem.config.js"
echo ""
echo "See MIGRATION_GUIDE.md for detailed instructions."
