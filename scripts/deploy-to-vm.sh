#!/bin/bash
# Deploy application to Oracle VM
# Usage: ./deploy-to-vm.sh <VM_IP> <SSH_KEY_PATH>

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: ./deploy-to-vm.sh <VM_IP> <SSH_KEY_PATH>"
    echo "Example: ./deploy-to-vm.sh 123.456.789.0 ~/.ssh/oracle-vm-key.pem"
    exit 1
fi

VM_IP=$1
SSH_KEY=$2
REMOTE_DIR="/opt/monitor-layout"

echo "🚀 Deploying Monitor Layout to VM..."
echo "=================================="
echo "VM IP: $VM_IP"
echo "SSH Key: $SSH_KEY"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

# Check if we can connect
echo "🔐 Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 ubuntu@"$VM_IP" "echo '✅ SSH connection successful'"; then
    echo "❌ Failed to connect to VM"
    exit 1
fi

# Create temporary build directory
echo "📦 Building application locally..."
npm install
npm run build

# Create deployment archive
echo "📦 Creating deployment archive..."
tar -czf /tmp/monitor-layout-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='data' \
    --exclude='*.log' \
    --exclude='.env*' \
    .next package.json package-lock.json public lib components app drizzle

echo "📤 Uploading to VM..."
scp -i "$SSH_KEY" /tmp/monitor-layout-deploy.tar.gz ubuntu@"$VM_IP":/tmp/

echo "🔄 Deploying on VM..."
ssh -i "$SSH_KEY" ubuntu@"$VM_IP" << 'ENDSSH'
set -e

cd /opt/monitor-layout

# Backup current deployment
if [ -d ".next" ]; then
    echo "💾 Backing up current deployment..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    tar -czf "backups/deploy-backup-$timestamp.tar.gz" .next package.json 2>/dev/null || true
fi

# Backup database
if [ -f "data/monitor-layout.db" ]; then
    echo "💾 Backing up database..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp "data/monitor-layout.db" "backups/monitor-layout-$timestamp.db"
    
    # Keep only last 7 backups
    cd backups
    ls -t monitor-layout-*.db | tail -n +8 | xargs -r rm
    cd ..
fi

# Extract new deployment
echo "📦 Extracting new deployment..."
tar -xzf /tmp/monitor-layout-deploy.tar.gz

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Restart application
echo "🔄 Restarting application..."
pm2 restart monitor-layout || pm2 start ecosystem.config.js

# Clean up
rm /tmp/monitor-layout-deploy.tar.gz

echo "✅ Deployment complete!"
pm2 status
ENDSSH

# Clean up local temp file
rm /tmp/monitor-layout-deploy.tar.gz

echo ""
echo "✅ Deployment successful!"
echo "🌐 Your app should now be running on http://$VM_IP"
echo ""
echo "📊 Check status: ssh -i $SSH_KEY ubuntu@$VM_IP 'pm2 status'"
echo "📝 View logs: ssh -i $SSH_KEY ubuntu@$VM_IP 'pm2 logs monitor-layout'"
