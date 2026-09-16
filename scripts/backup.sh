#!/bin/bash
# Database backup script for Oracle VM
# Run this on the VM itself

BACKUP_DIR="/opt/monitor-layout/backups"
DB_PATH="/opt/monitor-layout/data/monitor-layout.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/monitor-layout-$DATE.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found: $DB_PATH"
    exit 1
fi

# Create backup
echo "💾 Creating backup: $BACKUP_FILE"
cp "$DB_PATH" "$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

# Verify backup
if [ -f "$BACKUP_FILE.gz" ]; then
    size=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "✅ Backup created successfully: $BACKUP_FILE.gz ($size)"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Keep only last 14 days of backups
echo "🧹 Cleaning old backups (keeping last 14 days)..."
find "$BACKUP_DIR" -name "monitor-layout-*.db.gz" -mtime +14 -delete

# Show remaining backups
echo ""
echo "📋 Available backups:"
ls -lh "$BACKUP_DIR"/monitor-layout-*.db.gz 2>/dev/null || echo "No backups found"

# Calculate total backup size
total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo ""
echo "💾 Total backup size: $total_size"
