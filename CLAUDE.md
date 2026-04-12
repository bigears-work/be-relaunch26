# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WordPress child theme for **Big Ears Webagentur** website relaunch. Extends the GeneratePress parent theme with advanced GSAP-based scroll animations and interactive UI effects.

- **Parent theme:** GeneratePress
- **Text domain:** `bew`
- **Remote:** https://github.com/bigears-work/be-relaunch26.git

## Build & Development

**No build pipeline exists.** There is no package.json, webpack, Vite, Sass compilation, or test runner. All assets are plain CSS and vanilla JavaScript committed directly to the repository. Cache busting is handled via PHP `filemtime()` in `inc/enqueue.php`.

To develop:
1. Copy the theme folder into a WordPress installation's `wp-content/themes/` directory
2. Activate the theme with GeneratePress installed as the parent
3. Edit files directly — changes are reflected immediately (no build step)

## Architecture

### PHP Entry Point
`functions.php` loads three modular includes:
- `inc/enqueue.php` — registers GSAP core + plugins and all custom JS files with proper dependency ordering
- `inc/editor-styles.php` — hides post title wrapper in Gutenberg block editor
- `inc/login-screen.php` — injects custom logo and styles on the WP login screen

### JavaScript (`assets/js/`)
All files are vanilla JS using GSAP. Each file handles one animation concern:

| File | Trigger | Key selectors |
|---|---|---|
| `hero-anim.js` | Front page only | `.tagline`, `.be-claim` |
| `card-reveal.js` | Scroll into view | `.gbp-section__inner`, `.gbp-card__stagger` |
| `about-anim.js` | Scroll into view | `#about`, `#bio-img`, `#bio-txt` |
| `magnetic-btn.js` | Mouse proximity | `.magnetic` (+ modifier classes) |
| `menu-scroll-indicator.js` | Scroll position | Nav `<a>` with hash hrefs |
| `logo-anim.js` | Scroll | Custom logo in header |

All animations respect `prefers-reduced-motion`. Touch vs. desktop is detected for scrub timing adjustments (touch uses scrub `3`, desktop uses `1.5`).

### GSAP (`assets/gsap/`)
GSAP v3.12.2 is vendored directly (not via npm). Plugins in use: `ScrollTrigger`, `SplitText`. Additional bundled plugins (`ScrollSmoother`, `ScrollToPlugin`, `Observer`) are available but not currently enqueued.

### CSS (`style.css`, `assets/css/`)
- `style.css` — theme header + CTA button system + animation initial states
- `assets/css/login-styles.css` — login screen branding

The CTA button system (`.be-cta__wrapper`) uses a responsive role-flip: on mobile the phone button is primary/large; at 768px+ the Calendly button becomes primary/large.

**CSS custom properties used throughout:**
```
--base        #FFF8F0  (light warm background)
--base-2      (secondary background)
--contrast    #1d1d1b  (dark text)
--accent      #FC8A49  (orange)
```

## Known Exclusions

Per project decision: **Flickity** (carousel) and **blur effects** are not used in this theme. Do not reintroduce them.
