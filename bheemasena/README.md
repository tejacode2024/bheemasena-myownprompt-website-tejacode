# Bheemasena

Royal Feast — restaurant + food-ordering website built with Vite, React 19, TypeScript, Tailwind v4, Motion, and GSAP.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve the built bundle locally
```

## Drop in your media

Three media slots are referenced from code. Put your files here, then they'll appear without any code changes:

| File                                          | Used by              |
| --------------------------------------------- | -------------------- |
| `public/videos/bheemasena-intro-video.mp4`    | Hero (plays once, then cross-fades to the poster image) |
| `public/images/bheemasena-intro-picture.jpg`  | Hero poster + post-video still |
| `public/videos/login-page-video.mp4`          | Login page background (autoplay loop muted) |

The hero will fall back to the poster image if the video errors or if the user has `prefers-reduced-motion: reduce`.

All other imagery on the site renders through `<ImagePlaceholder />` — a cream-toned rounded rectangle at the correct aspect ratio. Replace each `ImagePlaceholder` with a real `<img>` when you're ready; the surrounding layout will not shift.

## Configure the brand (one file)

All brand-level constants — address, hours, phone, email, Zomato URL, social links, currency, tax — live in **`src/data/site.ts`**. UI components never hard-code these values; update once and the whole site follows.

```ts
// src/data/site.ts
export const SITE = {
  name: 'Bheemasena',
  address: 'TBD — client to provide full address',
  phoneDisplay: '+91 000 000 0000',
  phoneE164:    '+910000000000',     // WhatsApp target — digits only after the +
  email: 'hello@bheemasena.io',
  zomatoUrl: 'https://www.zomato.com/REPLACE_ME',
  // ...
}
```

## Swap the Google sign-in stub for real OAuth

`src/state/authStore.ts` exports `signInWithGoogle()`, which today just returns a mock user. Replace its body with your real OAuth flow (Firebase Auth, Auth.js, Supabase, etc.) — there is a `// TODO:` comment marking the exact line.

The store's public surface — `user`, `mode`, `setGuest()`, `logout()`, `isAuthenticated()` — should stay the same so the rest of the app keeps working.

## Extending menu / blog / team

- **Menu:** `src/data/menu.ts` — typed `MenuItem` records grouped by category. Add an item by appending to the array; the menu page, the landing preview, and the cart all pick it up.
- **Blog:** `src/data/blog.ts` — `slug`, `title`, `date`, `excerpt`, `body`. `body` is a markdown string; the post page renders it through `react-markdown`.
- **Team:** `src/data/team.ts`
- **Reviews:** `src/data/reviews.ts`
- **Amenities:** `src/data/amenities.ts` (icon names come from `lucide-react`)

## State

- `src/state/cartStore.ts`  — zustand + `persist` to `localStorage` (key `bheemasena:cart`)
- `src/state/authStore.ts`  — auth user + guest mode (key `bheemasena:auth`)
- `src/state/orderStore.ts` — placed orders (key `bheemasena:orders`)
- `src/state/uiStore.ts`    — cart drawer, reserve modal, toast list, lang toggle

## Routes

| Path           | Component       | Notes |
| -------------- | --------------- | --- |
| `/`            | `Landing`       | full landing page |
| `/menu`        | `MenuPage`      | full menu + reviews + footer |
| `/blog`        | `BlogList`      | 6-card grid |
| `/blog/:slug`  | `BlogPost`      | markdown article |
| `/login`       | `Login`         | full-bleed video, Google + Guest |
| `/orders`      | `Orders`        | auth-gated, grouped by date |
| `*`            | redirect `/`    | unknown routes return to landing |

## Motion

- `motion/react` for all component animations.
- `gsap` + `ScrollTrigger` only for: marquee, Team header pinning, GiftCard "30% Off" scrub rotate.
- All effects respect `prefers-reduced-motion`.
