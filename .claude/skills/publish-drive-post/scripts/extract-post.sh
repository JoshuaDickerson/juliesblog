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

echo "==== images ===="
i=0
shopt -s nullglob
for img in "$WORK/unzipped/images/"*; do
  i=$((i + 1))
  out="$IMG_DIR/${SLUG}-${i}.jpg"
  # Resize to max 1600px on the long edge and re-encode as JPEG. Garden photos
  # are large PNGs out of Drive; this typically shrinks them ~6x with no visible
  # loss, which matters for a GitHub Pages site.
  sips -s format jpeg -Z 1600 "$img" --out "$out" >/dev/null
  dims="$(sips -g pixelWidth -g pixelHeight "$out" | awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w"x"h}')"
  echo "assets/images/${SLUG}-${i}.jpg  (${dims})  <- use these as width/height attrs"
done
[ "$i" -eq 0 ] && echo "(no images in this export)"

echo
echo "==== exported HTML (shows paragraph/image order) ===="
cat "$WORK/unzipped/"*.html
echo
