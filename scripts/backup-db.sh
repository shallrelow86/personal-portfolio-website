#!/bin/bash
DB="/opt/portfolio/data.db"
BACKUP_DIR="/opt/portfolio/backups"
mkdir -p "$BACKUP_DIR"
BACKUP="$BACKUP_DIR/data-$(date +%Y%m%d).db"
sqlite3 "$DB" ".backup $BACKUP"
TS=$(date -Iseconds)
echo "$TS backup ok $BACKUP" >> "$BACKUP_DIR/backup.log"
echo "{\"at\":\"$TS\",\"file\":\"$BACKUP\"}" > "$BACKUP_DIR/last_backup.json"
