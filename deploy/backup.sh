#!/bin/sh
# Nightly backup: database dump + uploaded files. Keeps 14 days locally.
# Copy deploy/backups/ off the server too (e.g. rclone to Google Drive / S3).
set -e
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p /backups
pg_dump -h db -U "${POSTGRES_USER:-easyvisa}" -d "${POSTGRES_DB:-easyvisa}" -Fc -f "/backups/db-$STAMP.dump"
tar -czf "/backups/files-$STAMP.tar.gz" -C /data private-uploads media
find /backups -type f -mtime +14 -delete
echo "backup ok $STAMP"

# Restore (run on the server):
#   docker compose -f deploy/docker-compose.prod.yml exec -T db pg_restore -U easyvisa -d easyvisa --clean < deploy/backups/db-XXXX.dump
#   tar -xzf deploy/backups/files-XXXX.tar.gz -C <volume mount>
