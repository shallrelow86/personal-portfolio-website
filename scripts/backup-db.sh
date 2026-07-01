#!/bin/bash
DB="/opt/portfolio/data.db"
BACKUP_DIR="/opt/portfolio/backups"
mkdir -p "$BACKUP_DIR"
BACKUP="$BACKUP_DIR/data-$(date +%Y%m%d).db"
sqlite3 "$DB" ".backup $BACKUP"
echo "$(date -Iseconds) backup ok $BACKUP" >> "$BACKUP_DIR/backup.log"
