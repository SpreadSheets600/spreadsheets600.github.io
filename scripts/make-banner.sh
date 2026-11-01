#!/usr/bin/env bash
# Builds docs/banner.png: random wallpaper with a round profile photo overlapping its bottom edge.
set -euo pipefail

API="${PUBLIC_API_BASE:-https://spreadsheets600-api-io.spreadsheets600.workers.dev}"
AVATAR="https://avatars.githubusercontent.com/u/115402296?v=4&s=360"
OUT="docs/banner.png"
mkdir -p docs
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

WALL_URL="$(curl -fsS -m 15 "$API/header?format=json" | python3 -c 'import json,sys; print(json.load(sys.stdin)["url"])')"
curl -fsSL -m 60 "$WALL_URL" -o "$TMP/wall"
curl -fsSL -m 30 "$AVATAR" -o "$TMP/avatar"

W=1200; BANNER=250; D=180; H=$((BANNER+D/2+10))

magick "$TMP/wall" -resize "${W}x${BANNER}^" -gravity center -extent "${W}x${BANNER}" "$TMP/top.png"
magick "$TMP/avatar" -resize "${D}x${D}^" -gravity center -extent "${D}x${D}" \
  \( -size "${D}x${D}" xc:black -fill white -draw "circle $((D/2)),$((D/2)) $((D/2)),0" \) \
  -alpha off -compose CopyOpacity -composite "$TMP/pfp.png"
magick -size "${W}x${H}" xc:"#0d1117" "$TMP/top.png" -gravity northwest -composite \
  -fill "#0d1117" -draw "circle 150,${BANNER} 150,$((BANNER-D/2-8))" \
  "$TMP/pfp.png" -geometry "+60+$((BANNER-D/2))" -composite \
  "$OUT"
echo "wrote $OUT from $WALL_URL"
