# Xia Wu Academic Website

A static personal website published with GitHub Pages from `main` and the repository root.

- `index.html` and `zh.html`: complete English and Simplified Chinese pages. Keep the structure, anchor IDs, and paragraph order aligned when updating the copy; each page remains readable without JavaScript.
- `language.js`: remembers language choice and preserves the corresponding reading position when switching. Explicit `?lang=en` / `?lang=zh` links override the preference.
- `styles.css`: responsive layouts, bounded photos, reading column, and light/dark themes.
- `app.js`: optional theme preference, footer year, and a decorative DNA field in the margins and home section. The animation pauses in hidden tabs and respects reduced-motion settings. Content does not depend on JavaScript, scroll animations, or remote fonts.
- `assets/`: original photographs. Gallery photographs use individual focal positions to keep the person visible, with links to the full originals; story images retain their natural proportions. Images below the hero load lazily and reserve their dimensions.

To preview, serve this directory with a static HTTP server. Check desktop, tablet, and mobile widths, direct chapter links, keyboard focus, and the page with JavaScript disabled. No build step is required.
