# Media files — upload guide

This is the complete inventory of every image/video slot in the customer
site. Every path below is **relative to `bheemasena/public/`** — drop a
file at the path and it appears on the site automatically (after the
next deploy).

Until a file is uploaded, the slot shows a cream placeholder box. Nothing
crashes.

## How to upload an **image**

1. Resize/compress to a sensible size (recommended: ≤ 1600 px wide, JPEG quality 80, < 400 KB per file).
2. Save it with the **exact filename** listed in the table below — including the extension.
3. Drop it into the corresponding folder under `bheemasena/public/`.
4. Commit + push (Vercel redeploys automatically).

## How to upload a **video**

Two ways:

### A. Video-only slot (simplest)

Just save your video at the same path with a video extension (`.mp4` / `.webm` / `.mov`) and update **one line of code** to point at it. Example for the gift-card section:

```tsx
// bheemasena/src/components/sections/GiftCard.tsx
<MediaPlaceholder aspect="4/3" label="dining hall"
  src="/images/giftcard/dining-hall.mp4" />
```

`MediaPlaceholder` auto-detects video vs. image from the extension.

### B. Video with image fallback (recommended for hero-style slots)

Upload both files (e.g. `dining-hall.mp4` and `dining-hall.jpg`) and tell `MediaPlaceholder` to use the video first, falling back to the image if the browser can't play it:

```tsx
<MediaPlaceholder aspect="4/3" label="dining hall"
  src="/images/giftcard/dining-hall.jpg"
  videoSrc="/videos/giftcard/dining-hall.mp4" />
```

If the video fails to load (codec issue, file missing, slow network, reduced-motion preference), the image takes over automatically. The cream placeholder takes over only if **both** fail.

**Video tips:**

- Format: H.264 MP4 is the broadest support; add a WebM if you want better compression for modern browsers.
- Duration: 6–12 s loops feel best (the component plays muted, looping, autoplay).
- Size: aim for < 4 MB. Mute the audio track before exporting — autoplay only works on muted video.
- Aspect ratio: match the slot's aspect (see table) or accept that `object-fit: cover` will crop.

---

## The complete filename inventory

### Hero (landing page top)

| slot | path | type | code reference |
| --- | --- | --- | --- |
| Intro video | `videos/bheemasena-intro-video.mp4` | video (loops once → image) | `bheemasena/src/components/hero/HeroVideo.tsx:61` |
| Intro fallback image | `images/bheemasena-intro-picture.jpeg` | image | `HeroVideo.tsx:72` |

The hero plays the video once, then cross-fades to the still image. To change either, replace the file at the path above. To change the extension you must edit the line in `HeroVideo.tsx`.

### Login page background

| slot | path | type | code reference |
| --- | --- | --- | --- |
| Login background video | `videos/login-page-video.mp4` | video (loops) | `bheemasena/src/routes/Login.tsx:144` |

There is no still-image fallback for the login background — the page shows ink-black if the video is missing.

### Marquee strip (landing — "Gallery marquee")

8 tiles, aspect 4:3. Same path pattern; only the number changes.

| tile | path |
| --- | --- |
| 1 | `images/marquee/dish-1.jpeg` |
| 2 | `images/marquee/dish-2.jpeg` |
| 3 | `images/marquee/dish-3.jpeg` |
| 4 | `images/marquee/dish-4.jpeg` |
| 5 | `images/marquee/dish-5.jpeg` |
| 6 | `images/marquee/dish-6.jpeg` |
| 7 | `images/marquee/dish-7.jpeg` |
| 8 | `images/marquee/dish-8.jpeg` |

Code reference: `bheemasena/src/components/sections/Marquee.tsx:5-12`.

### Gallery grid (landing — 8 tiles, 6 filled)

6 image slots, aspect 1:1. Tiles 2 and 6 are intentionally empty (decorative gaps).

| tile | path |
| --- | --- |
| 1 | `images/gallery/gallery-1.jpg` |
| 2 | `images/gallery/gallery-2.jpg` |
| 3 | `images/gallery/gallery-3.jpg` |
| 4 | `images/gallery/gallery-4.jpg` |
| 5 | `images/gallery/gallery-5.jpg` |
| 6 | `images/gallery/gallery-6.jpg` |

Code reference: `bheemasena/src/components/sections/Gallery.tsx:29`.

### Gift card section (landing)

| slot | path | aspect |
| --- | --- | --- |
| Dining hall | `images/giftcard/dining-hall.jpg` | 4:3 |

Code reference: `bheemasena/src/components/sections/GiftCard.tsx:64`.

### Team (landing — 4 portrait cards, aspect 4:5)

| member | path | code reference |
| --- | --- | --- |
| Lakshman Rao (Executive Chef) | `images/team/lakshman-rao.jpg` | `bheemasena/src/data/team.ts:7` |
| Anika Sharma (Sous Chef) | `images/team/anika-sharma.jpg` | `team.ts:13` |
| Rohit Verma (General Manager) | `images/team/rohit-verma.jpg` | `team.ts:19` |
| Meera Iyer (Pastry Chef) | `images/team/meera-iyer.jpg` | `team.ts:25` |

To change a team member's image source, edit the `image:` line in `team.ts`.

### Menu category heroes (full menu page + landing preview, aspect 4:5)

| category | path |
| --- | --- |
| Veg Starters | `images/menu/category-veg-starters.jpeg` |
| Non-Veg Starters | `images/menu/category-non-veg-starters.jpg` |
| Veg Biryani | `images/menu/category-veg-biryani.jpeg` |
| Non-Veg Biryani | `images/menu/category-non-veg-biryani.jpeg` |
| Mini Biryani | `images/menu/category-mini-biryani.jpeg` |
| Breads | `images/menu/category-breads.jpg` |
| Veg Curries | `images/menu/category-veg-curries.jpeg` |
| Non-Veg Curries | `images/menu/category-non-veg-curries.jpeg` |

⚠️ Note the mixed `.jpg` / `.jpeg` extensions — the code references whichever your previously uploaded files use. The full list lives in `bheemasena/src/components/sections/MenuSection.tsx:22-31`.

### Blog hero images (6 articles, aspect 16:9)

| post | path | code reference |
| --- | --- | --- |
| Article 1 | `images/blog/blog-1.jpeg` | `bheemasena/src/data/blog.ts:15` |
| Article 2 | `images/blog/blog-2.jpeg` | `blog.ts:46` |
| Article 3 | `images/blog/blog-3.jpeg` | `blog.ts:76` |
| Article 4 | `images/blog/blog-4.jpeg` | `blog.ts:105` |
| Article 5 | `images/blog/blog-5.jpg` | `blog.ts:140` |
| Article 6 | `images/blog/blog-6.jpeg` | `blog.ts:172` |

To change a post's hero image, edit the `image:` line in `blog.ts`.

---

## Status — what's already uploaded vs missing

After this commit:

```
bheemasena/public/
├─ videos/
│  ├─ bheemasena-intro-video.mp4    ✓ present
│  ├─ login-page-video.mp4          ✓ present
│  └─ chilli-burst.mp4              (unused — safe to remove)
├─ images/
│  ├─ bheemasena-intro-picture.jpeg ✓ present
│  ├─ marquee/dish-1.jpeg…dish-8.jpeg ✓ all 8 present
│  ├─ menu/category-*.jpg/.jpeg     ✓ all 8 present
│  ├─ blog/blog-1.jpeg…blog-6.jpeg  blog-5 missing; others present
│  ├─ team/.gitkeep                 ✗ folder ready, 4 portraits needed
│  ├─ gallery/.gitkeep              ✗ folder ready, 6 tiles needed
│  └─ giftcard/.gitkeep             ✗ folder ready, 1 image needed
```

So the **must-upload list** to make every placeholder render real media:

1. `images/team/lakshman-rao.jpg`
2. `images/team/anika-sharma.jpg`
3. `images/team/rohit-verma.jpg`
4. `images/team/meera-iyer.jpg`
5. `images/gallery/gallery-1.jpg` through `gallery-6.jpg`
6. `images/giftcard/dining-hall.jpg`
7. `images/blog/blog-5.jpg`

Everything else is already in place.

---

## How `MediaPlaceholder` decides what to render

```
                  ┌──────────────────────────────────────────────┐
                  │ Has `videoSrc`?                              │
                  │  ├─ Yes → try video → on error use `src` →   │
                  │  │        on error → cream placeholder       │
                  │  └─ No  → check `src` extension              │
                  │           ├─ .mp4/.webm/.mov → video         │
                  │           ├─ image ext      → image          │
                  │           └─ none or 404    → cream box      │
                  │                                              │
                  │ Reduced motion: video slots show poster      │
                  │ (or `src` image) instead of autoplay.        │
                  └──────────────────────────────────────────────┘
```

In short: if you want the simplest path, upload `.jpg` files at the listed names. If you want a video for any slot, either replace the extension in the matching `.tsx` file, or upload both formats and add a `videoSrc` prop next to the `src` to get automatic fallback.
