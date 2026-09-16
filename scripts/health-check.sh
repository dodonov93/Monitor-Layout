#!/bin/bash
# Health check script for Oracle VM
# Run this on the VM to check system health

echo "🏥 Monitor Layout Health Check"
echo "=============================="
echo ""

# Check if running on VM
if [ ! -d "/opt/monitor-layout" ]; then
    echo "❌ Not running on VM (app directory not found)"
    exit 1
fi

# System resources
echo "💻 System Resources:"
echo "-------------------"
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "  Used: " 100 - $1 "%"}'

echo "Memory Usage:"
free -h | grep Mem | awk '{print "  Used: " $3 " / " $2 " (" int($3/$2 * 100) "%)"}'

echo "Disk Usage:"
df -h / | tail -1 | awk '{print "  Used: " $3 " / " $2 " (" $5 ")"}'

echo ""

# PM2 Status
echo "⚙️  Application Status:"
echo "---------------------"
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 jlist 2>/dev/null)
    if echo "$pm2_status" | grep -q "monitor-layout"; then
        echo "✅ PM2 process running"
        pm2 list | grep -A1 "monitor-layout"
    else
        echo "❌ PM2 process not found"
    fi
else
    echo "❌ PM2 not installed"
fi

echo ""

# Caddy Status
echo "🌐 Web Server Status:"
echo "--------------------"
if systemctl is-active --quiet caddy; then
    echo "✅ Caddy is running"
else
    echo "❌ Caddy is not running"
fi

echo ""

# Database Status
echo "💾 Database Status:"
echo "------------------"
DB_PATH="/opt/monitor-layout/data/monitor-layout.db"
if [ -f "$DB_PATH" ]; then
    db_size=$(du -h "$DB_PATH" | cut -f1)
    echo "✅ Database found: $db_size"
    
    # Check database integrity
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        echo "✅ Database integrity OK"
    else
        echo "⚠️  Database integrity issues detected!"
    fi
    
    # Count records
    user_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM user;" 2>/dev/null || echo "N/A")
    layout_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM gallery_layout;" 2>/dev/null || echo "N/A")
    echo "  Users: $user_count"
    echo "  Layouts: $layout_count"
else
    echo "❌ Database not found: $DB_PATH"
fi

echo ""

# Backups
echo "💾 Backup Status:"
echo "----------------"
BACKUP_DIR="/opt/monitor-layout/backups"
if [ -d "$BACKUP_DIR" ]; then
    backup_count=$(find "$BACKUP_DIR" -name "monitor-layout-*.db*" | wc -l)
    latest_backup=$(ls -t "$BACKUP_DIR"/monitor-layout-*.db* 2>/dev/null | head -1)
    
    if [ "$backup_count" -gt 0 ]; then
        echo "✅ $backup_count backup(s) found"
        if [ -n "$latest_backup" ]; then
            backup_age=$(stat -c %y "$latest_backup" | cut -d' ' -f1,2 | cut -d'.' -f1)
            backup_size=$(du -h "$latest_backup" | cut -f1)
            echo "  Latest: $backup_age ($backup_size)"
        fi
    else
        echo "⚠️  No backups found"
    fi
else
    echo "❌ Backup directory not found"
fi

echo ""

# Network connectivity
echo "🌐 Network Status:"
echo "-----------------"
if curl -s --max-time 5 http://localhost:3000 > /dev/null; then
    echo "✅ App responding on localhost:3000"
else
    echo "❌ App not responding on localhost:3000"
fi

if curl -s --max-time 5 http://localhost:80 > /dev/null; then
    echo "✅ Caddy responding on port 80"
else
    echo "❌ Caddy not responding on port 80"
fi

echo ""

# Logs
echo "📝 Recent Errors (last 50 lines):"
echo "---------------------------------"
if [ -f "/opt/monitor-layout/logs/err.log" ]; then
    error_count=$(tail -50 /opt/monitor-layout/logs/err.log 2>/dev/null | grep -i error | wc -l)
    if [ "$error_count" -gt 0 ]; then
        echo "⚠️  Found $error_count error(s) in recent logs"
        tail -10 /opt/monitor-layout/logs/err.log
    else
        echo "✅ No recent errors"
    fi
else
    echo "📋 No error log found"
fi

echo ""
echo "=============================="
echo "Health check complete!"
