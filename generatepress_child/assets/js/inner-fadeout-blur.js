document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Helps with mobile address-bar resize jitter.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Respect reduced-motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Refresh when layout is stable (fonts/images).
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  window.addEventListener('orientationchange', () => ScrollTrigger.refresh());

  let refreshTimer;
  window.addEventListener('resize', () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }, { passive: true });

  // ===== Tuning =====
  const ROW_TOLERANCE = 4;   // px
  const BLUR_OUT  = 2;       // px
  const ALPHA_OUT = 0.85;

  // Within a row (cards) this can still look great.
  const STAGGER_EACH = 0.08;

  // Fixed header offset (adjust selector if needed).
  const header = document.querySelector('.gb-site-header'); // change if your header uses a different selector
  const headerOffset = () => (header ? header.getBoundingClientRect().height : 0) + 8;

  // Start/End are functions so they stay accurate after refresh.
  // "bottom ..." prevents tall blocks from blurring too early.
  const START_FN = () => `top top+=${headerOffset()}`;
  const END_FN   = () => `bottom top+=${headerOffset()}`;

  const SKIP_SEL = '.reveal-blur-skip, [data-reveal-blur-skip]';

  let ctx;

  function isNestedRevealBlur(node) {
    const parentReveal = node.parentElement && node.parentElement.closest('.reveal-blur');
    return !!(parentReveal && parentReveal !== node);
  }

  function groupIntoRows(els) {
    const sorted = [...els].sort((a, b) => {
      const dt = a.offsetTop - b.offsetTop;
      if (Math.abs(dt) > ROW_TOLERANCE) return dt;
      return a.offsetLeft - b.offsetLeft;
    });

    const rows = [];
    sorted.forEach((el) => {
      const last = rows[rows.length - 1];
      if (!last || Math.abs(el.offsetTop - last.top) > ROW_TOLERANCE) {
        rows.push({ top: el.offsetTop, els: [el] });
      } else {
        last.els.push(el);
      }
    });

    return rows.map(r => r.els);
  }

  function pickSequentialTargets(container) {
    // 1) Manual override: only .reveal-blur-item inside the container
    const explicit = Array.from(container.querySelectorAll('.reveal-blur-item'))
      .filter(el =>
        el.offsetParent !== null &&
        !el.matches(SKIP_SEL) &&
        !el.closest(SKIP_SEL)
      );

    if (explicit.length) return explicit;

    // 2) Auto-pick common content blocks in DOM order
    const sel = [
      '.gbp-card__title',
      '.gbp-section__text',
      'p',
      'h1,h2,h3,h4,h5,h6',
      '.gb-text',
      'a',
      'button'
    ].join(',');

    const targets = Array.from(container.querySelectorAll(sel));

    return targets.filter(el =>
      el.offsetParent !== null &&
      !el.matches(SKIP_SEL) &&
      !el.closest(SKIP_SEL)
    );
  }

  function build() {
    if (ctx) ctx.revert();

    ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray('.reveal-blur')
        .filter(node => !isNestedRevealBlur(node));

      nodes.forEach((node) => {
        // Don't blur the wrapper itself (prevents "big blurry block").
        // Also remove any accidental inline styles on the wrapper.
        gsap.set(node, { clearProps: 'filter,opacity,visibility' });

        // CASE A: Card grid wrapper -> row-wise blur
        const cards = Array.from(node.querySelectorAll('.gbp-card'))
          .filter(el => !el.matches(SKIP_SEL) && !el.closest(SKIP_SEL));

        if (cards.length >= 2) {
          gsap.set(cards, { autoAlpha: 1, filter: 'blur(0px)' });

          const rows = groupIntoRows(cards);

          rows.forEach((rowEls) => {
            gsap.timeline({
              scrollTrigger: {
                trigger: rowEls[0],
                start: START_FN,
                end: END_FN,
                scrub: true,
                invalidateOnRefresh: true,
                // markers: true
              }
            }).to(rowEls, {
              autoAlpha: ALPHA_OUT,
              filter: `blur(${BLUR_OUT}px)`,
              ease: 'none',
              stagger: { each: STAGGER_EACH },
              overwrite: 'auto'
            }, 0);
          });

          return;
        }

        // CASE B: Container with multiple text blocks -> per-item triggers (accurate on mobile)
        const targets = pickSequentialTargets(node);

        if (targets.length >= 2) {
          gsap.set(targets, { autoAlpha: 1, filter: 'blur(0px)' });

          targets.forEach((el) => {
            gsap.to(el, {
              autoAlpha: ALPHA_OUT,
              filter: `blur(${BLUR_OUT}px)`,
              ease: 'none',
              overwrite: 'auto',
              scrollTrigger: {
                trigger: el,
                start: START_FN,
                end: END_FN,
                scrub: true,
                invalidateOnRefresh: true,
                // markers: true
              }
            });
          });

          return;
        }

        // CASE C: Single element wrapper -> blur itself
        // (If the wrapper contains no eligible children, animate the wrapper.)
        const t = targets[0] || node;
        if (t.matches(SKIP_SEL) || t.closest(SKIP_SEL)) return;

        gsap.set(t, { autoAlpha: 1, filter: 'blur(0px)' });

        gsap.to(t, {
          autoAlpha: ALPHA_OUT,
          filter: `blur(${BLUR_OUT}px)`,
          ease: 'none',
          overwrite: 'auto',
          scrollTrigger: {
            trigger: t,
            start: START_FN,
            end: END_FN,
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      });
    });

    // Ensure measurements update after we created triggers.
    ScrollTrigger.refresh();
  }

  build();

  // ===== Resume handling (mobile app-switch / tab restore) =====
  // On iOS/Android, returning to an already-open page can change the visual viewport / toolbar state.
  // That can leave ScrollTrigger with stale start/end positions, causing "everything blurs" until you scroll back.
  function refreshOnResume() {
    // Run after layout has a chance to settle.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();

      // One more frame helps when the browser UI (address bar) is still animating.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        ScrollTrigger.update();
      });
    });

    // Safety net a bit later (fonts/images/header may settle after resume).
    setTimeout(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    }, 200);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshOnResume();
  });

  // BFCache restore (common in Safari/iOS): DOMContentLoaded won't fire again.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) refreshOnResume();
  });

  // Rebuild (not just refresh) on resize because rows may reflow (breakpoints).
  let rebuildTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(build, 200);
  }, { passive: true });
});