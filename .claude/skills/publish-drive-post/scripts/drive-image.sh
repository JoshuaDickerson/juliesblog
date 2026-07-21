#!/usr/bin/env bash
# drive-image.sh — Decode ONE image downloaded via the Drive connector's
# `download_file_content` and write a web-optimized JPEG into the repo.
#
# Unlike extract-post.sh (which unpacks a whole Google Doc export), this handles
# a single binary image file stored in Drive — e.g. the garden-profile photos,
# which are uploaded as their own files and therefore come back at FULL
# resolution (no Doc-export downsampling).
#
# Usage:
#   drive-image.sh <tool-results-file> <output-path-relative-to-repo>
#
#   <tool-results-file>  Path the download_file_content tool printed
#                        ("Output has been saved to <path>"). JSON:
#                        {content: <base64>, id, mimeType, title}.
#   <output-path>        e.g. assets/images/gardens/guinea-road-after-1.jpg
#
# Prints the source Drive title (so you can confirm you grabbed the right file)
# and the final dimensions. Requires jq and macOS `sips`.

set -euo pipefail

SRC="${1:?Usage: drive-image.sh <tool-results-file> <output-path>}"
OUT_REL="${2:?Missing <output-path>, e.g. assets/images/gardens/foo-after-1.jpg}"
REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
OUT="$REPO/$OUT_REL"

# Match the site's house settings for photos (see the images note in SKILL.md).
CAP=2048
QUALITY=55

mkdir -p "$(dirname "$OUT")"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

TITLE="$(jq -r '.title // "?"' "$SRC")"
jq -r '.content' "$SRC" | base64 -d > "$WORK/raw"

ow="$(sips -g pixelWidth  "$WORK/raw" | awk '/pixelWidth/{print $2}')"
oh="$(sips -g pixelHeight "$WORK/raw" | awk '/pixelHeight/{print $2}')"
long="$oh"; [ "${ow:-0}" -gt "${oh:-0}" ] && long="$ow"

args=(-s format jpeg -s formatOptions "$QUALITY")
# Never upscale: only resize when the original exceeds the cap.
if [ "${long:-0}" -gt "$CAP" ]; then
  args+=(-Z "$CAP")
fi
sips "${args[@]}" "$WORK/raw" --out "$OUT" >/dev/null

nw="$(sips -g pixelWidth  "$OUT" | awk '/pixelWidth/{print $2}')"
nh="$(sips -g pixelHeight "$OUT" | awk '/pixelHeight/{print $2}')"
kb=$(( $(stat -f '%z' "$OUT") / 1024 ))

printf '%-46s <- "%s"  %sx%s -> %sx%s  %sKB\n' \
  "$OUT_REL" "$TITLE" "${ow}" "${oh}" "$nw" "$nh" "$kb"
