# CLAUDE.md

## What this is

A gardening blog for Julie, hosted on **GitHub Pages** as a static site. There is
no build step, framework, or backend — the deployed site is plain HTML/CSS (and
minimal JS) served directly from this repository.

## Content workflow

> This pipeline is codified as the **`publish-drive-post`** project skill
> (`.claude/skills/publish-drive-post/`). To publish a post, invoke that skill —
> it bundles the extraction script and the post-page template. The steps below
> are the reference for what it does.

Julie writes blog content in **Google Drive**. The pipeline is:

1. Julie authors a post as a Google Doc inside the `posts/` subfolder of the
   shared Google Drive folder:
   https://drive.google.com/drive/folders/1-KsL6-cmj4hpQJ2ju58iW3N1_sBSu-xb
   - Root folder ID: `1-KsL6-cmj4hpQJ2ju58iW3N1_sBSu-xb`
   - `posts/` folder ID: `1hoiSVpa7rfymOOtwd3yb5azcch_yKxAv`
   - Docs appear to be named by date + title, e.g. `2026-06-06 Test`.
2. Pull the document down using the **Google Drive connector** (the
   `search_files` / `read_file_content` / `download_file_content` MCP tools).
   List the `posts/` folder (`parentId = '<posts-id>'`), read the source doc,
   and download any embedded images.

   **Getting the text:** `read_file_content` returns the doc's text but omits
   images (they show up as blank gaps between paragraphs).

   **Getting the images:** export the doc as a ZIP, which bundles an HTML file
   plus an `images/` folder with each image as a separate file. The base64 ZIP
   is too big to return inline, so the connector saves it to a file and prints
   the path. Decode and extract it, then optimize photos for the web:
   ```sh
   # SRC = the tool-results .txt path the connector printed
   jq -r '.content' "$SRC" | base64 -d > post.zip
   unzip post.zip                     # -> *.html + images/image1.png ...
   # optimize each photo into the repo (resize to 1600px wide, PNG->JPEG):
   sips -s format jpeg -Z 1600 images/image1.png \
     --out assets/images/<date>-<slug>-<desc>.jpg
   ```
   The exported HTML shows the paragraph/image order to reproduce in the post.

   **Access note:** the connector must be authenticated as a Google account that
   can see this folder (it is owned by `joshuajdickerson@gmail.com`). If
   `search_files`/`get_file_metadata` return "entity not found," the folder isn't
   shared with the connected account — reconnect or re-share, don't assume the
   folder is empty.
3. Convert the document into a static blog post HTML page in this repo, following
   the site's existing markup and styling conventions.
4. Commit and push to the default branch — GitHub Pages redeploys automatically.

When asked to "publish" or "pull a new post," this is the workflow to follow.

## Conventions

- **Static only.** Do not introduce a build tool, bundler, or server-side code
  unless the user explicitly asks. Keep everything servable as-is by GitHub Pages.
- **Faithful conversion.** When recreating a Drive doc as HTML, preserve Julie's
  wording, headings, and image placement. Clean up formatting for the web, but do
  not rewrite her content.
- **Images.** Download images from Drive into the repo (e.g. an `images/` or
  `assets/` directory) and reference them with relative paths — never hotlink
  Google Drive URLs.
- **Match existing structure.** Before adding a post, look at how existing pages
  are laid out and mirror their structure, naming, and styling.

## Deployment

- Hosting: GitHub Pages, served from this repo.
- Entry point: `index.html`.
- Publishing = pushing to the default branch (`main`). No manual deploy step.

## Site structure

- `index.html` — the page shell: a left **sidebar** (masthead + "Posts" nav list)
  and a right **main** area holding the post `article`. Currently renders a demo
  post with placeholder content marked `[Placeholder]` — replace when real posts
  are pulled from Drive.
- `assets/theme.css` — **all design tokens** (colors, fonts, spacing) as CSS
  custom properties in `:root`. This is the whole "skin": edit here to re-theme.
  Current theme is "Fern & Foxglove" (PNW greens + a foxglove-pink accent),
  with *Fraunces* for display/titles and *Karla* for body/UI (Google Fonts).
- `assets/styles.css` — structure and components; reads only from the theme
  tokens. Don't hardcode colors/sizes here — add or use a token instead.

### Post layout convention

Each post is its own page reusing the `index.html` shell, added to the sidebar
`.posts__list` (newest first, with a `June D, YYYY` date and title). The first
real post — [posts/2026-06-06-second-post.html](posts/2026-06-06-second-post.html)
— is the reference example (note its `../` relative paths for assets and the
`index.html` link, since it lives one folder deep). **The sidebar is duplicated
in every page** (no build step / includes), so adding a post means updating the
`.posts__list` in `index.html` and every post page. The post body lives in a
`.entry-grid` — a 6-column responsive grid (single column on mobile) whose
children mix text and images "in paragraph form." Building blocks:

- `.block.prose` — a text block (full width, capped at a readable measure).
- `.prose--lead` — the opening block; its first letter gets a drop-cap.
- `.block--two-third` / `.block--half` / `.block--third` — column spans, used to
  place text and figures side by side (they stack on mobile automatically).
- `.figure` (with `.figure--bleed` for full-width) — an image + `figcaption`.
- `.pullquote` — a centered display-serif pull quote.

Placeholder photo tiles use `<div class="ph">`; swap these for real `<img>`
elements once images are downloaded from Drive into `assets/` (or an `images/`
folder) and referenced with relative paths.

### Local preview

`.claude/launch.json` defines a `site` config that serves the repo with
`python3 -m http.server 4300`.
