# 🚀 Oracle Cloud VM Migration - Getting Started

You've hit Turso's 50 GB data transfer limit. This guide will help you migrate to Oracle Cloud's free tier VM and save $348/year.

---

## 📊 Quick Facts

| Current (Turso Free) | Upgrade Option | **Recommended Option** |
|---------------------|----------------|----------------------|
| 50 GB transfer (maxed out) | Turso Starter: $29/month | **Oracle VM: $0/month** |
| Need to upgrade | 500 GB transfer | **10,000 GB transfer** |
| | $348/year cost | **12 GB RAM + 2 CPUs** |
| | | **$0 forever** |

**Annual Savings:** $348 by choosing Oracle VM over Turso Starter

---

## 📚 Documentation Overview

### Start Here
1. **[COMPARISON.md](./COMPARISON.md)** - Read this first
   - Full cost comparison
   - Performance analysis
   - Decision framework
   - Your specific situation breakdown

### Migration Guide
2. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Complete step-by-step guide
   - 12 phases from setup to production
   - Parallel deployment strategy (zero risk)
   - Rollback procedures
   - Troubleshooting section

### Quick Reference
3. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Daily operations
   - Common commands
   - Health checks
   - Backup/restore
   - Troubleshooting

---

## 🛠️ Automated Scripts

All scripts are in the `scripts/` directory and are ready to use:

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `vm-setup.sh` | Initial VM configuration | Once during setup |
| `deploy-to-vm.sh` | Deploy app to VM | Every update/deployment |
| `backup.sh` | Backup database | Daily (automated via cron) |
| `restore-backup.sh` | Restore from backup | When needed |
| `health-check.sh` | System health monitoring | Daily/weekly checks |

---

## 🎯 Quick Start (30 Minutes)

### Phase 1: Set Up Oracle VM
1. Create Oracle Cloud account (5 min)
2. Launch ARM VM (2 OCPU, 12 GB RAM) (5 min)
3. Configure firewall rules (5 min)
4. SSH into VM (2 min)
5. Run `vm-setup.sh` (10 min)
6. Done! ✅

### Phase 2: Deploy Your App (15 Minutes)
```bash
# From your local machine
./scripts/deploy-to-vm.sh YOUR_VM_IP your-ssh-key.pem
```

### Phase 3: Test (1-2 Weeks)
- Access via `http://YOUR_VM_IP`
- Test all features
- Run in parallel with current Turso setup
- No pressure, no downtime

### Phase 4: Go Live (5 Minutes)
- Update DNS to point to VM
- Monitor for 48 hours
- Cancel Turso subscription
- Celebrate $348/year savings! 🎉

---

## 📁 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `ecosystem.config.js` | PM2 process manager | Copy to `/opt/monitor-layout/` |
| `Caddyfile.example` | Web server config | Copy to `/etc/caddy/Caddyfile` |
| `.env.production.example` | Environment vars | Copy to `/opt/monitor-layout/.env.production` |

---

## ✅ Why This Works

### Easy Migration
- ✅ You're already using SQLite (Turso is SQLite-based)
- ✅ No code changes needed
- ✅ No schema changes needed
- ✅ Just change connection string from remote to local file

### Zero Risk
- ✅ Run both systems in parallel
- ✅ Test thoroughly before switching
- ✅ Easy rollback if needed
- ✅ Keep Turso as backup during transition

### Great Value
- ✅ Save $348/year (or $1,044 over 3 years)
- ✅ Get 200x more data transfer
- ✅ Better performance (50x faster DB queries)
- ✅ Full control over infrastructure

---

## 🎓 Prerequisites

**Technical Skills Needed:**
- Basic Linux command line (cd, ls, nano)
- SSH connection
- Understanding of environment variables
- Git basics (optional)

**Don't worry if you're new to this!** The migration guide includes:
- Every command you need to run
- Explanations of what each command does
- Troubleshooting for common issues
- Screenshots and examples

---

## 💰 Cost Breakdown

### 3-Year Total Cost

| Solution | Setup | Monthly | Year 1 | Year 2 | Year 3 | **Total** |
|----------|-------|---------|--------|--------|--------|-----------|
| **Turso Starter** | $0 | $29 | $348 | $348 | $348 | **$1,044** |
| **Oracle VM** | 4 hrs | $0 | $0 | $0 | $0 | **$0** |

**Your Savings:** $1,044 over 3 years

---

## 🔒 Security & Reliability

The migration guide includes:
- ✅ Automated daily backups
- ✅ Database integrity checks
- ✅ Health monitoring scripts
- ✅ Log rotation
- ✅ Automatic HTTPS (Let's Encrypt)
- ✅ Security headers configuration
- ✅ Firewall setup
- ✅ SSH key authentication

---

## 📞 Support

### Issues During Migration?

1. **Check QUICK_REFERENCE.md** - Troubleshooting section
2. **Check MIGRATION_GUIDE.md** - Phase 12 (Troubleshooting)
3. **Review logs:**
   ```bash
   pm2 logs monitor-layout
   sudo journalctl -u caddy -n 50
   ```

### Common Questions

**Q: Can I still use Vercel?**
A: Yes! You can keep Vercel for the frontend and only move the database. See MIGRATION_GUIDE.md Phase 7 for hybrid setup.

**Q: What if something breaks?**
A: Easy rollback - just change DNS back to Vercel. Your Turso setup stays running during testing.

**Q: Is Oracle Cloud really free forever?**
A: Yes! It's their "Always Free" tier, not a trial. See [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)

**Q: Can I upgrade later if needed?**
A: Yes! Oracle offers paid tiers if you need more resources. But the free tier is generous enough for most small-medium apps (12 GB RAM, 2 CPUs).

---

## 🎯 Decision Framework

### Choose Oracle VM if:
- ✅ You want to save $348/year
- ✅ You're comfortable with basic Linux
- ✅ You can invest 2-4 hours for setup
- ✅ You want better performance

### Choose Turso Starter if:
- ✅ You want zero maintenance
- ✅ You need global edge replication
- ✅ $29/month is acceptable
- ✅ You prefer managed services

---

## 🚀 Ready to Start?

### Recommended Reading Order:

1. **[COMPARISON.md](./COMPARISON.md)** (10 min read)
   - Understand the full picture
   - Make an informed decision

2. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** (15 min read)
   - Understand the process
   - See what's involved

3. **Execute Phase 1-2** (45 min work)
   - Set up Oracle VM
   - Deploy your app

4. **Test for 1-2 weeks**
   - Run in parallel with Turso
   - Verify everything works

5. **Go Live** (5 min)
   - Switch DNS
   - Cancel Turso subscription

---

## 📈 What You'll Achieve

After migration:
- 💰 **$348/year savings** (or $1,044 over 3 years)
- 🚀 **200x more data transfer** (10 TB vs 50 GB)
- ⚡ **50x faster database** (<1ms vs 20-50ms)
- 🎯 **Full control** over your infrastructure
- 📚 **New DevOps skills** (valuable for career)
- 🏆 **Independence** from vendor limitations

---

## 🎉 Let's Get Started!

**Next Step:** Open [COMPARISON.md](./COMPARISON.md) and read the full analysis.

Good luck with your migration! You're about to save a lot of money and gain some valuable experience. 🚀

---

*Last updated: September 2026*
