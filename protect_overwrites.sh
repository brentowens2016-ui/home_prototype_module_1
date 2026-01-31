#!/bin/bash
# Overwrite protection script for Home Prototype Module 1 (Unix/Linux/macOS)
# Prevents accidental overwrites of critical files by creating .bak backups
set -e

protect_files=(
  requirements.txt
  python_wrapper/requirements.txt
  rust_smart_bulbs/requirements.txt
  dashboard/package.json
  dashboard/package-lock.json
  .env
  python_wrapper/users.json
  python_wrapper/device_mapping.json
)

for f in "${protect_files[@]}"; do
  if [ -f "$f" ]; then
    if [ ! -f "$f.bak" ]; then
      cp "$f" "$f.bak"
      echo "[✔] Backup created for $f as $f.bak"
    fi
  fi
  # Prevent overwrite if backup exists and file is newer than backup
  if [ -f "$f.bak" ] && [ "$f" -nt "$f.bak" ]; then
    echo "[!] Warning: $f has changed since last backup. Review before overwriting."
  fi
  # Optionally, refuse to overwrite unless --force is passed
  # (Uncomment below to enforce)
  # if [ -f "$f.bak" ] && [ "$f" -nt "$f.bak" ] && [ "$1" != "--force" ]; then
  #   echo "[!] Refusing to overwrite $f. Use --force to override."
  #   exit 1
  # fi
  
  # To restore: cp "$f.bak" "$f"
done
