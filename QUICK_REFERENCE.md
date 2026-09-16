# Oracle VM Migration - Quick Reference

## 📋 Quick Start Checklist

### Phase 1: Set Up Oracle Cloud VM (30 minutes)
- [ ] Create Oracle Cloud free tier account
- [ ] Launch ARM VM (2 OCPU, 12 GB RAM)
- [ ] Configure firewall rules (ports 80, 443)
- [ ] Save VM public IP address
- [ ] Download SSH private key

### Phase 2: Initial VM Setup (15 minutes)
```bash
# Upload setup script to VM
scp -i your-key.pem scripts/vm-setup.sh ubuntu@YOUR_VM_IP:/tmp/

# SSH into VM
ssh -i your-key.pem ubuntu@YOUR_VM_IP

# Run setup script
bash /tmp/vm-setup.sh
```

### Phase 3: Deploy Application (20 minutes)

**From your local machine:**
```bash
# Deploy to VM (automated)
./scripts/deploy-to-vm.sh YOUR_VM_IP your-key.pem
```

**OR manually on the VM:**
```bash
# Clone your repo
cd /opt/monitor-layout
git clone YOUR_REPO_URL .

# Create environment file
cp .env.production.example .env.production
nano .env.production  # Fill in your values

# Install and build
npm install
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Phase 4: Configure Web Server (5 minutes)
```bash
# Edit Caddyfile
sudo nano /etc/caddy/Caddyfile
```

**For testing (HTTP only):**
```caddy
:80 {
    reverse_proxy localhost:3000
    encode gzip
}
```

**For production (Auto HTTPS):**
```caddy
your-domain.com {
    reverse_proxy localhost:3000
    encode gzip
}
```

```bash
# Restart Caddy
sudo systemctl restart caddy
```

### Phase 5: Set Up Backups (5 minutes)
```bash
# Test backup script
cd /opt/monitor-layout
./scripts/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add this line:
```
0 2 * * * /opt/monitor-layout/scripts/backup.sh >> /opt/monitor-layout/logs/backup.log 2>&1
```

---

## 🚀 Common Commands

### Application Management
```bash
# Check app status
pm2 status

# View logs
pm2 logs monitor-layout

# Restart app
pm2 restart monitor-layout

# Stop app
pm2 stop monitor-layout

# Monitor resources
pm2 monit
```

### Database Management
```bash
# Backup database
./scripts/backup.sh

# Restore from backup
./scripts/restore-backup.sh /opt/monitor-layout/backups/monitor-layout-YYYYMMDD_HHMMSS.db.gz

# Check database size
du -h /opt/monitor-layout/data/monitor-layout.db

# Query database
sqlite3 /opt/monitor-layout/data/monitor-layout.db "SELECT COUNT(*) FROM user;"
```

### System Health
```bash
# Run health check
./scripts/health-check.sh

# Check disk space
df -h

# Check memory usage
free -h

# Check system load
htop
```

### Web Server
```bash
# Check Caddy status
sudo systemctl status caddy

# Restart Caddy
sudo systemctl restart caddy

# View Caddy logs
sudo journalctl -u caddy -n 50
```

### Deployment
```bash
# From local machine (automated deploy)
./scripts/deploy-to-vm.sh YOUR_VM_IP your-key.pem

# OR on VM (manual deploy)
cd /opt/monitor-layout
git pull origin main
npm install
npm run build
pm2 restart monitor-layout
```

---

## 🔧 Troubleshooting

### App not responding
```bash
pm2 restart monitor-layout
pm2 logs monitor-layout --lines 100
```

### Database errors
```bash
# Check database integrity
sqlite3 /opt/monitor-layout/data/monitor-layout.db "PRAGMA integrity_check;"

# Restore from backup
./scripts/restore-backup.sh BACKUP_FILE
```

### Can't connect to VM
```bash
# Check firewall
sudo iptables -L -n | grep -E '80|443'

# Check Caddy
sudo systemctl status caddy

# Check app
pm2 status
```

### Out of disk space
```bash
# Check disk usage
df -h

# Clean old logs
pm2 flush
find /opt/monitor-layout/logs -name "*.log" -mtime +7 -delete

# Clean old backups
find /opt/monitor-layout/backups -name "*.db.gz" -mtime +14 -delete
```

---

## 🌐 DNS Configuration

### Testing Phase
**Subdomain for testing:**
- Type: `A`
- Name: `test` (or `vm`, `oracle`)
- Value: `YOUR_VM_PUBLIC_IP`
- TTL: `300`

### Production Cutover
**Main domain:**
- Type: `A`
- Name: `@` (root) or `www`
- Value: `YOUR_VM_PUBLIC_IP`
- TTL: `300`

---

## 💰 Cost Savings

| Period | Turso Starter | Oracle VM | Savings |
|--------|--------------|-----------|---------|
| Monthly | $29 | $0 | $29 |
| Annual | $348 | $0 | $348 |
| 3 Years | $1,044 | $0 | $1,044 |

---

## 📊 Resource Usage Monitoring

### Daily Checks
```bash
pm2 status           # App health
./scripts/health-check.sh  # Full system check
```

### Weekly Checks
```bash
# Check backups
ls -lh /opt/monitor-layout/backups/

# Check disk space
df -h

# Check database size
du -h /opt/monitor-layout/data/
```

### Monthly Checks
```bash
# Review logs for errors
grep -i error /opt/monitor-layout/logs/*.log | tail -50

# Clean old backups (keep 30 days)
find /opt/monitor-layout/backups -mtime +30 -delete

# Update system
sudo apt update && sudo apt upgrade -y
```

---

## 🔐 Security Best Practices

### SSH Security
```bash
# Disable password authentication (use keys only)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### Keep System Updated
```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Firewall Rules
```bash
# Review current rules
sudo iptables -L -n

# Block specific IP (if needed)
sudo iptables -A INPUT -s MALICIOUS_IP -j DROP
sudo netfilter-persistent save
```

---

## 📞 Support Resources

- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Caddy Docs**: https://caddyserver.com/docs/
- **SQLite Docs**: https://www.sqlite.org/docs.html

---

## 🎯 Success Criteria

Before switching production:
- [ ] VM running for 7+ days without issues
- [ ] All features working on test domain
- [ ] Backups running daily automatically
- [ ] Health checks passing
- [ ] Response times acceptable
- [ ] No memory leaks (check `pm2 monit`)
- [ ] Logs clean (no recurring errors)

---

## 🔄 Rollback Plan

If issues occur after cutover:

**Immediate rollback (5 minutes):**
1. Update DNS A record back to Vercel IP
2. Wait 5-10 minutes for DNS propagation
3. Verify old system works

**VM stays running for debugging without pressure**

---

## 📈 Next Steps After Migration

1. Monitor for 1 week on test domain
2. Test all functionality thoroughly
3. Run load tests
4. Switch DNS to production
5. Monitor for 48 hours
6. Cancel Turso subscription
7. Celebrate $348/year savings! 🎉
