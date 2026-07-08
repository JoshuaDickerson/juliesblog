#!/usr/bin/env bash
# extract-post.sh — Decode a Google Drive doc ZIP export and optimize its images
# for the web, dropping them into the repo's assets/images/ folder.
#
# Why this exists: the Drive connector's `download_file_content` (exportMimeType
# application/zip) returns a base64 ZIP that is almost always too large to read
# back into the model's context, so the connector saves it to a tool-results
# file and prints the path. This script takes that file, decodes it, unzips the
# HTML + images, and converts each photo to a right-sized JPEG. It also prints
# the exported HTML so you can see the paragraph/image order to reproduce.
#
# Usage:
#   extract-post.sh <tool-results-file> <slug> [repo-root]
#
#   <tool-results-file>  Path the download_file_content tool printed
#                        ("Output has been saved to <path>").
#   <slug>               Post slug, e.g. 2026-06-20-first-harvest.
#                        Images are written as <slug>-1.jpg, <slug>-2.jpg, ...
#   [repo-root]          Defaults to the current git repo root.
#
# Requires: jq, unzip, and macOS `sips` (swap for ImageMagick if not on macOS).

set -euo pipefail

SRC="${1:?Usage: extract-post.sh <tool-results-file> <slug> [repo-root]}"
SLUG="${2:?Missing <slug>, e.g. 2026-06-20-first-harvest}"
REPO="${3:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# The tool-results file is JSON: {content: <base64 zip>, id, mimeType, title}.
jq -r '.content' "$SRC" | base64 -d > "$WORK/post.zip"
unzip -o -q "$WORK/post.zip" -d "$WORK/unzipped"

IMG_DIR="$REPO/assets/images"
mkdir -p "$IMG_DIR"

# Long-edge cap and JPEG quality. 2560 keeps full-bleed photos crisp on hi-DPI
# (retina) screens, where a full-width image can need ~2x its CSS pixels; a
# smaller cap looks soft/pixelated when the browser upscales it. QUALITY 90
# keeps visible detail (garden foliage) without JPEG mush. We NEVER upscale —
# an original smaller than the cap is re-encoded at its native size.
CAP=2560
QUALITY=90

echo "==== images ===="
count=0
seq=0
shopt -s nullglob
for img in "$WORK/unzipped/images/"*; do
  seq=$((seq + 1))
  base="$(basename "$img")"
  # Google names exports imageN.ext; key the output on that N so <slug>-N always
  # maps to imageN in the exported HTML (a plain glob would sort image10 before
  # image2, mismatching the references). Fall back to sequence if there's no digit.
  num="$(printf '%s' "$base" | sed -E 's/[^0-9]*([0-9]+).*/\1/')"
  case "$num" in ''|*[!0-9]*) num=$seq ;; esac
  out="$IMG_DIR/${SLUG}-${num}.jpg"
  ow="$(sips -g pixelWidth "$img"  | awk '/pixelWidth/{print $2}')"
  oh="$(sips -g pixelHeight "$img" | awk '/pixelHeight/{print $2}')"
  long="$oh"; [ "${ow:-0}" -gt "${oh:-0}" ] && long="$ow"
  if [ "${long:-0}" -gt "$CAP" ]; then
    # Downscale large photos to the cap.
    sips -s format jpeg -s formatOptions "$QUALITY" -Z "$CAP" "$img" --out "$out" >/dev/null
  else
    # Smaller than the cap: re-encode at native size, do NOT upscale.
    sips -s format jpeg -s formatOptions "$QUALITY" "$img" --out "$out" >/dev/null
  fi
  dims="$(sips -g pixelWidth -g pixelHeight "$out" | awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w"x"h}')"
  echo "assets/images/${SLUG}-${num}.jpg  (${dims})  <- imageN maps to -N; use as width/height attrs"
  count=$((count + 1))
done
[ "$count" -eq 0 ] && echo "(no images in this export)"

echo
echo "==== exported HTML (shows paragraph/image order) ===="
cat "$WORK/unzipped/"*.html
echo
