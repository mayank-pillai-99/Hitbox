# 4. A flat design system, and plain `<img>` tags

## Context
The first version used frosted glass (translucent panels, blur, glowing gradients). It was heavy on mobile GPUs, repeated the same long class strings in dozens of places, and several classes were used but never defined. The visual reference is Marathon's "graphic realism": flat, hard-edged, high contrast, with a neon accent set.

## Decision
- A flat look: solid panels with 1px borders, square corners, hazard-stripe dividers, heavy display type with mono labels, and four meaningful neon colours (lime for emphasis, cyan for information, magenta for likes and destructive actions, amber for warnings).
- All tokens and primitives live in one stylesheet (`globals.css`), inside a CSS layer so Tailwind utilities still override them. Pages are assembled from shared components (`components/ui`) rather than copied markup.
- Accessibility is built in: every interactive element has a visible focus ring, targets are at least 44px, dialogs use one accessible `Modal`, and the text colours are chosen to pass WCAG AA. An automated scan (axe) over the main pages found no violations.
- Images stay plain `<img>` tags (the `no-img-element` lint rule is off on purpose).

## Consequences
- A restyle is mostly a change to one file; the removal of blur removes the largest mobile rendering cost.
- Using `next/image` would route IGDB covers and user avatars through Vercel's image optimiser, whose free quota is small; IGDB's CDN already serves right-sized covers and avatars come from arbitrary hosts. If the project moved to a paid plan, covers would be the first thing to move to `next/image`.
