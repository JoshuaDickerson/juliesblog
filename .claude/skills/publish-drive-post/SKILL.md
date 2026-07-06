---
name: publish-drive-post
description: >-
  Pull a gardening blog post from Julie's Google Drive folder and publish it as a
  static HTML page on this GitHub Pages site. Use this whenever the user wants to
  add, publish, import, or sync a new blog post from Drive — e.g. "pull the latest
  post from Drive", "publish Julie's new post", "add a new blog entry", "there's a
  new doc in the posts folder", or "sync the blog." Handles the full pipeline:
  finding the doc, extracting its text and images, optimizing images, building the
  post page from the site template, and wiring it into the sidebar nav.
---

# Publish a Drive post to the blog

This site is a static gardening blog (see the repo's `CLAUDE.md` for the big
picture). Julie writes each post as a Google Doc in a shared Drive folder; your
job is to turn one of those docs into a blog post page that matches the site's
existing design. Work faithfully — preserve Julie's words and the order of her
text and images; clean up formatting for the web, but don't rewrite her content.

## Prerequisites

The **Google Drive connector** must be authenticated as an account that can see
the folder (owned by `joshuajdickerson@gmail.com`). Its tools may be deferred —
load them with ToolSearch first:

```
select:mcp__<drive-server>__search_files,mcp__<drive-server>__read_file_content,mcp__<drive-server>__download_file_content
```

If `search_files` returns "entity not found" or an empty result for the folder,
the connector is signed into the wrong account — tell the user to reconnect or
share the folder; don't assume the folder is empty.

Drive folder IDs:
- Blog root: `1-KsL6-cmj4hpQJ2ju58iW3N1_sBSu-xb`
- `posts/` (where docs live): `1hoiSVpa7rfymOOtwd3yb5azcch_yKxAv`

## Steps

### 1. Find the doc
List the posts folder: `search_files` with `parentId = '1hoiSVpa7rfymOOtwd3yb5azcch_yKxAv'`.
Compare against posts already on the site (`posts/*.html`) to find what's new. If
it's ambiguous which doc the user means, ask. Note the doc's `id` and `title` —
titles look like `2026-06-06 Second Post` (date + name).

### 2. Read the text
Call `read_file_content` on the doc id. This gives the prose but **omits images**
(they appear as blank gaps between paragraphs). Note where the gaps are — that's
where images belong in the final layout.

### 3. Extract the images
Call `download_file_content` with `exportMimeType: application/zip`. Google
bundles the doc as an HTML file plus an `images/` folder. The base64 ZIP is
almost always too big to return inline, so the connector saves it to a
tool-results file and prints "Output has been saved to `<path>`".

Run the bundled script with that path and a **slug** (lowercase, date-first,
kebab-case — e.g. `2026-06-20-first-harvest`):

```sh
scripts/extract-post.sh <tool-results-path> <slug>
```

It decodes the ZIP, writes web-optimized JPEGs to `assets/images/<slug>-N.jpg`,
prints each image's dimensions, and prints the exported HTML so you can see the
exact paragraph/image order. **Look at each image** (Read the JPEG) so you can
write accurate, specific `alt` text — describe what's actually in the photo.

### 4. Choose a slug and title
- **Slug**: `YYYY-MM-DD-kebab-title` from the doc's date and a short title.
- **Display title**: the doc's opening line usually works as the post title (it
  reads like a headline). Don't duplicate it as both title and first body line.
- The file goes at `posts/<slug>.html`.

### 5. Build the post page
Copy `assets/post-template.html` (in this skill) to `posts/<slug>.html` and fill
the placeholders: `{{TITLE}}`, `{{META_DESCRIPTION}}` (one plain sentence),
`{{DATE}}` (e.g. `June 20, 2026`), `{{POSTS_LIST}}`, and `{{BODY}}`.

Build `{{BODY}}` from the content blocks below, in Julie's original order. The
`.entry-grid` is a 6-column responsive grid that collapses to one column on
mobile. Use these building blocks (all defined in `assets/styles.css`):

- **Text** — `<div class="block prose"><p>…</p></div>`. Add `prose--lead` on the
  first text block to get the drop-cap opening.
- **Text beside an image** — a `prose` block with `block--two-third` next to a
  `figure` with `block--third` (they stack on mobile automatically). Also
  `block--half` for an even split.
- **Full-width photo** — `<figure class="figure figure--bleed"><img …></figure>`.
- **Two photos side by side** — two `figure block--half` figures.
- **Pull quote** — `<blockquote class="pullquote">…</blockquote>`.
- **Caption** — `<figcaption>` inside a figure (optional; don't invent facts like
  locations — keep captions to what's true or omit them).

For every `<img>`: set `src="../assets/images/<slug>-N.jpg"`, the real `width` and
`height` from the script output (prevents layout shift), `loading="lazy"`, and
descriptive `alt`. The CSS already keeps images at their natural aspect ratio —
do **not** add inline width/height styles that would distort them.

### 6. Wire it into the navigation
The sidebar `.posts__list` is **duplicated on every page** (no build step), so add
the new entry to *both* `index.html` and every file in `posts/`. Newest first.
Each entry:

```html
<li class="posts__item">
  <a class="posts__link" href="POST_HREF">
    <span class="posts__date">June 20, 2026</span>
    <span class="posts__title">Post title</span>
  </a>
</li>
```

Path rules (GitHub Pages serves under a subpath, so use relative links, never
root-relative `/`):
- On `index.html`: link posts as `posts/<slug>.html`.
- On a `posts/*.html` page: link siblings as `<slug>.html`, the home page as
  `../index.html`, and assets as `../assets/...`.
- The page that represents the current post gets `aria-current="page"` on its
  `<li>` (this draws the foxglove "stem" accent). Remove `aria-current` from the
  others on that page.

### 7. Verify in the browser
Start the preview (`.claude/launch.json` has a `site` config) and check the new
post: the layout holds, the sidebar lists all posts with the right one active,
and — importantly — **images are not stretched**. Confirm the displayed aspect
ratio matches the image's natural ratio; if a photo looks squished, an inline
height style or a stray attribute is overriding `height: auto`.

## Notes

- **Faithfulness first.** Keep Julie's text and image order. Web cleanup is fine;
  rewriting her voice is not.
- **Images**: always optimize through the script (or an equivalent resize+JPEG).
  Full-size Drive PNGs are multi-megabyte and bad for a Pages site.
- **Growing the nav**: if the duplicated sidebar becomes tedious as posts pile
  up, that's the signal to propose a shared-sidebar include or a static-site
  generator — mention it, but don't refactor mid-publish without asking.
