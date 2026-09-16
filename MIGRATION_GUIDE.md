# Migration Guide: Turso to Oracle Cloud VM

This guide will help you migrate from Turso to a self-hosted SQLite database on Oracle Cloud's free tier VM, while keeping your current Turso setup running until you're confident in the new system.

## Overview

**Strategy**: Dual-environment setup
- **Production (Current)**: Vercel + Turso (keep running)
- **Testing (New)**: Oracle VM + Local SQLite (test thoroughly)
- **Cutover**: Switch DNS when ready (zero downtime)

---

## Phase 1: Oracle Cloud VM Setup

### Step 1.1: Create Oracle Cloud Account

1. Go to [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Sign up for free tier account
3. Verify your account (requires credit card but won't charge)

### Step 1.2: Create ARM-based VM Instance

1. **Login to Oracle Cloud Console**
2. Navigate to: **Compute > Instances > Create Instance**

3. **Configure Instance**:
   - **Name**: `monitor-layout-app`
   - **Image**: Ubuntu 22.04 or 24.04 (Minimal or Standard)
   - **Shape**: 
     - Click "Change Shape"
     - Select **VM.Standard.A1.Flex** (ARM-based, Ampere)
     - Set **OCPUs**: 4
     - Set **Memory**: 24 GB
   - **Boot Volume**: 100 GB (you can use up to 200 GB total)

4. **Networking**:
   - Create new VCN or use default
   - **Assign public IP**: Yes
   - Save the **Public IP address** (you'll need this)

5. **SSH Keys**:
   - Generate new key pair or upload your existing public key
   - **Download private key** if generating new one (keep it safe!)

6. **Click "Create"** and wait 2-3 minutes for provisioning

### Step 1.3: Configure Firewall Rules

1. In Oracle Console, go to **Networking > Virtual Cloud Networks**
2. Click your VCN > **Security Lists** > **Default Security List**
3. Click **Add Ingress Rules**:

   **Rule 1 (HTTP)**:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port: `80`
   
   **Rule 2 (HTTPS)**:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port: `443`

4. **Save Rules**

### Step 1.4: Connect to Your VM

```bash
# From your local machine
ssh -i /path/to/your-private-key.pem ubuntu@YOUR_VM_PUBLIC_IP

# If you get permission error on the key:
chmod 600 /path/to/your-private-key.pem
```

---

## Phase 2: VM Initial Setup

### Step 2.1: Update System and Configure Firewall

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure Ubuntu firewall (iptables)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# Install netfilter-persistent if needed
sudo apt install -y iptables-persistent
```

### Step 2.2: Install Node.js 20

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 2.3: Install Caddy (Web Server with Auto HTTPS)

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Verify installation
caddy version
```

### Step 2.4: Set Up Application Directory

```bash
# Create app directory
sudo mkdir -p /opt/monitor-layout
sudo chown ubuntu:ubuntu /opt/monitor-layout
cd /opt/monitor-layout

# Create data directory for SQLite
mkdir -p data
```

---

## Phase 3: Deploy Your Application

### Step 3.1: Clone Your Repository

```bash
cd /opt/monitor-layout

# Option A: If you have a git repository
git clone YOUR_REPO_URL .

# Option B: If no git repo, you'll need to upload files
# We'll create a deployment script for this
```

### Step 3.2: Create Environment Configuration

```bash
cd /opt/monitor-layout
nano .env.production
```

Add the following (adjust values as needed):

```env
# Auth Configuration
BETTER_AUTH_SECRET=your-secure-random-string-here-generate-new-one
BETTER_AUTH_URL=https://your-domain.com

# Admin Configuration
ADMIN_EMAIL=capital93@gmail.com
ADMIN_PASSWORD=your-secure-password-here

# Database Configuration (Local SQLite)
TURSO_DATABASE_URL=file:/opt/monitor-layout/data/monitor-layout.db
# TURSO_AUTH_TOKEN=   # Leave commented - not needed for local file

# Node Environment
NODE_ENV=production
```

**Generate a secure auth secret**:
```bash
# Generate random secret
openssl rand -base64 32
```

### Step 3.3: Install Dependencies and Build

```bash
cd /opt/monitor-layout

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 3.4: Initialize Database

Your app will auto-create the database on first run thanks to the `ensureSchema()` function. But let's verify:

```bash
# The database file will be created at:
# /opt/monitor-layout/data/monitor-layout.db

# Check if your app has a seed script
npm run seed  # Only if you have initial data to load
```

---

## Phase 4: Set Up Process Manager (PM2)

### Step 4.1: Install PM2

```bash
sudo npm install -g pm2
```

### Step 4.2: Create PM2 Ecosystem File

```bash
cd /opt/monitor-layout
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [{
    name: 'monitor-layout',
    script: 'npm',
    args: 'start',
    cwd: '/opt/monitor-layout',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/monitor-layout/logs/err.log',
    out_file: '/opt/monitor-layout/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
```

### Step 4.3: Start Application with PM2

```bash
# Create logs directory
mkdir -p /opt/monitor-layout/logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup systemd
# Follow the command it outputs (will be something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Check status
pm2 status
pm2 logs monitor-layout
```

---

## Phase 5: Configure Caddy (Reverse Proxy)

### Step 5.1: Create Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

**For testing without domain (HTTP only)**:

```caddy
:80 {
    reverse_proxy localhost:3000
    
    encode gzip
    
    log {
        output file /var/log/caddy/access.log
    }
}
```

**For production with domain (Auto HTTPS)**:

```caddy
your-domain.com {
    reverse_proxy localhost:3000
    
    encode gzip
    
    log {
        output file /var/log/caddy/access.log
    }
}
```

### Step 5.2: Start Caddy

```bash
# Test configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Restart Caddy
sudo systemctl restart caddy

# Enable on boot
sudo systemctl enable caddy

# Check status
sudo systemctl status caddy
```

---

## Phase 6: Testing Your VM Setup

### Step 6.1: Test Access

```bash
# Test from VM itself
curl http://localhost:3000

# Test from your local machine (replace with your VM's public IP)
curl http://YOUR_VM_PUBLIC_IP
```

### Step 6.2: Access in Browser

Open your browser and go to:
- **Testing**: `http://YOUR_VM_PUBLIC_IP`
- **Production** (with domain): `https://your-domain.com`

### Step 6.3: Verify Database Operations

1. **Create a test account** through the signup page
2. **Login** with the account
3. **Create some layouts** and switch between galleries
4. **Check that data persists** after page refresh
5. **Check PM2 logs** for any errors:
   ```bash
   pm2 logs monitor-layout
   ```

### Step 6.4: Monitor Resources

```bash
# Check resource usage
pm2 monit

# Or use htop
sudo apt install -y htop
htop
```

---

## Phase 7: Running Both Systems in Parallel

### Step 7.1: Keep Vercel + Turso Running

**DO NOT CHANGE** your current Vercel deployment. It will continue serving production traffic.

### Step 7.2: Set Up Test Domain or Subdomain

**Option A: Use Subdomain for Testing**
```
Production: https://yourapp.com (Vercel + Turso)
Testing:    https://test.yourapp.com (Oracle VM)
```

**Option B: Use Different Domain**
```
Production: https://yourapp.com (Vercel + Turso)
Testing:    https://oracle.yourapp.com (Oracle VM)
```

**Option C: Use IP Address for Testing**
```
Production: https://yourapp.com (Vercel + Turso)
Testing:    http://YOUR_VM_PUBLIC_IP (Oracle VM)
```

### Step 7.3: Update Caddyfile for Test Subdomain

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddy
test.yourapp.com {
    reverse_proxy localhost:3000
    encode gzip
}

# Keep your main domain pointing to Vercel for now
```

### Step 7.4: Point Test Subdomain to Oracle VM

In your DNS provider (Cloudflare, Namecheap, etc.):

**Add A Record**:
- **Type**: A
- **Name**: `test` (or `oracle`)
- **Value**: `YOUR_VM_PUBLIC_IP`
- **TTL**: 300 (5 minutes)

Wait 5-10 minutes for DNS propagation.

---

## Phase 8: Data Migration (Optional)

If you want to copy existing data from Turso to your VM:

### Step 8.1: Export Data from Turso

```bash
# On your local machine with Turso CLI
turso db shell your-database-name .dump > turso-dump.sql
```

### Step 8.2: Upload to VM

```bash
# From your local machine
scp -i your-key.pem turso-dump.sql ubuntu@YOUR_VM_PUBLIC_IP:/opt/monitor-layout/
```

### Step 8.3: Import to SQLite

```bash
# On the VM
cd /opt/monitor-layout

# Stop the app temporarily
pm2 stop monitor-layout

# Import the data
sqlite3 data/monitor-layout.db < turso-dump.sql

# Restart the app
pm2 start monitor-layout
```

---

## Phase 9: Testing Checklist

### Functional Testing

- [ ] User registration works
- [ ] User login works
- [ ] Admin panel accessible (if admin)
- [ ] Gallery layouts load
- [ ] Switching between galleries works
- [ ] Updating monitor layouts persists
- [ ] PDF generation works
- [ ] Logout works
- [ ] Session persistence works

### Performance Testing

- [ ] Page load times are acceptable
- [ ] Database queries are fast
- [ ] No memory leaks (check `pm2 monit` over 24 hours)
- [ ] Application auto-restarts on crashes

### Load Testing

```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test with 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:3000/

# Check if app handles load well
pm2 logs monitor-layout
```

### Backup Testing

```bash
# Create a backup script
nano /opt/monitor-layout/backup.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/opt/monitor-layout/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /opt/monitor-layout/data/monitor-layout.db "$BACKUP_DIR/monitor-layout-$DATE.db"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

echo "Backup completed: monitor-layout-$DATE.db"
```

```bash
# Make executable
chmod +x /opt/monitor-layout/backup.sh

# Test it
./backup.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
```

Add this line:
```
0 2 * * * /opt/monitor-layout/backup.sh >> /opt/monitor-layout/logs/backup.log 2>&1
```

---

## Phase 10: Monitoring & Maintenance

### Step 10.1: Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/monitor-layout
```

Add:

```
/opt/monitor-layout/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 ubuntu ubuntu
    sharedscripts
}
```

### Step 10.2: Monitor Disk Space

```bash
# Check disk usage
df -h

# Check database size
du -h /opt/monitor-layout/data/monitor-layout.db
```

### Step 10.3: Set Up Automatic Updates (Optional)

```bash
# Enable unattended upgrades for security patches
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Phase 11: Cutover to Production

### When You're Ready to Switch

1. **Verify Everything Works** on test domain for at least 1 week
2. **Export final data** from Turso if needed
3. **Update DNS** to point main domain to Oracle VM
4. **Keep Vercel running** for 24-48 hours as fallback

### Step 11.1: Update Main Domain DNS

In your DNS provider:

**Update A Record**:
- **Type**: A
- **Name**: `@` (root domain) or `www`
- **Value**: `YOUR_VM_PUBLIC_IP`
- **TTL**: 300 (5 minutes)

### Step 11.2: Update Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddy
yourapp.com, www.yourapp.com {
    reverse_proxy localhost:3000
    encode gzip
}
```

```bash
sudo systemctl restart caddy
```

### Step 11.3: Update Environment Variables

```bash
nano /opt/monitor-layout/.env.production
```

Update:
```env
BETTER_AUTH_URL=https://yourapp.com
```

```bash
# Restart app
pm2 restart monitor-layout
```

### Step 11.4: Monitor for Issues

```bash
# Watch logs closely
pm2 logs monitor-layout --lines 100

# Check for errors
grep -i error /opt/monitor-layout/logs/*.log
```

---

## Phase 12: Rollback Plan (If Needed)

If something goes wrong:

### Quick Rollback to Vercel + Turso

1. **Revert DNS**:
   - Change A record back to Vercel's IP
   - Or use CNAME pointing to your Vercel domain
   
2. **Wait for DNS propagation** (5-10 minutes)

3. **Verify old system works**

4. **Debug Oracle VM** without time pressure

---

## Deployment Script for Easy Updates

Create a deployment script for future updates:

```bash
nano /opt/monitor-layout/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /opt/monitor-layout

# Backup database
echo "📦 Backing up database..."
./backup.sh

# Pull latest code (if using git)
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart monitor-layout

echo "✅ Deployment complete!"
echo "📊 Checking status..."
pm2 status
```

```bash
chmod +x /opt/monitor-layout/deploy.sh
```

Usage:
```bash
./deploy.sh
```

---

## Cost Comparison After Migration

### Before (Turso Paid Tier)
- **Monthly cost**: $29
- **Annual cost**: $348

### After (Oracle Cloud Free Tier)
- **Monthly cost**: $0
- **Annual cost**: $0
- **Annual savings**: $348

---

## Troubleshooting

### Issue: Can't connect to VM

```bash
# Check if Caddy is running
sudo systemctl status caddy

# Check if app is running
pm2 status

# Check firewall
sudo iptables -L -n | grep -E '80|443'
```

### Issue: Database permission errors

```bash
# Fix permissions
sudo chown -R ubuntu:ubuntu /opt/monitor-layout/data
chmod 755 /opt/monitor-layout/data
chmod 644 /opt/monitor-layout/data/*.db
```

### Issue: App crashes

```bash
# Check logs
pm2 logs monitor-layout --err

# Restart app
pm2 restart monitor-layout

# If persistent, check memory
free -h
pm2 monit
```

### Issue: HTTPS not working

```bash
# Check Caddy logs
sudo journalctl -u caddy -n 50

# Verify domain points to VM
dig your-domain.com

# Test Let's Encrypt connection
curl -v https://your-domain.com
```

---

## Next Steps

1. ✅ Follow Phase 1-5 to set up Oracle VM
2. ✅ Test thoroughly on test subdomain (Phase 6-9)
3. ✅ Run both systems in parallel for 1-2 weeks
4. ✅ When confident, switch DNS to Oracle VM (Phase 11)
5. ✅ Keep Vercel as fallback for 48 hours
6. ✅ Cancel Turso Starter subscription (save $29/month)

---

## Questions?

If you run into issues during migration:
1. Check the Troubleshooting section
2. Review PM2 logs: `pm2 logs monitor-layout`
3. Check Caddy logs: `sudo journalctl -u caddy -n 100`
4. Verify your environment variables in `.env.production`

Good luck with your migration! 🚀
