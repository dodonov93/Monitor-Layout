#!/bin/bash
# Restore database from backup
# Run this on the VM itself
# Usage: ./restore-backup.sh <backup-file>

if [ "$#" -ne 1 ]; then
    echo "Usage: ./restore-backup.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh /opt/monitor-layout/backups/monitor-layout-*.db.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
DB_PATH="/opt/monitor-layout/data/monitor-layout.db"
TEMP_DIR="/tmp/monitor-layout-restore"

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restore
echo "⚠️  WARNING: This will replace the current database!"
echo "Current database: $DB_PATH"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Stop application
echo "🛑 Stopping application..."
pm2 stop monitor-layout

# Backup current database
echo "💾 Backing up current database..."
timestamp=$(date +%Y%m%d_%H%M%S)
cp "$DB_PATH" "/opt/monitor-layout/backups/pre-restore-$timestamp.db"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Extract backup
echo "📦 Extracting backup..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" > "$TEMP_DIR/restored.db"
else
    cp "$BACKUP_FILE" "$TEMP_DIR/restored.db"
fi

# Verify database integrity
echo "🔍 Verifying database integrity..."
if sqlite3 "$TEMP_DIR/restored.db" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo "✅ Database integrity check passed"
else
    echo "❌ Database integrity check failed!"
    rm -rf "$TEMP_DIR"
    pm2 start monitor-layout
    exit 1
fi

# Restore database
echo "🔄 Restoring database..."
cp "$TEMP_DIR/restored.db" "$DB_PATH"

# Set correct permissions
chown ubuntu:ubuntu "$DB_PATH"
chmod 644 "$DB_PATH"

# Clean up
rm -rf "$TEMP_DIR"

# Start application
echo "🚀 Starting application..."
pm2 start monitor-layout

echo ""
echo "✅ Database restored successfully!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs monitor-layout"
