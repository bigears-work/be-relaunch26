(function () {
  if (typeof window.gsap === "undefined") return;

  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  if (mq && mq.matches) return;

  function remToPx(rem) {
    var rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return rem * rootFont;
  }

  // Base "magnetic" feel (in rem so it scales with typography)
  var base = {
    triggerDistRem: 0.5,
    maxMoveRem: 0.25,
    durXY: 0.18,
    easeXY: "power3.out"
  };

  // Modifier factors (multiplicative)
  var MODS = {
    subtle: { zone: 0.80, move: 0.70, dur: 0.90 },
    strong: { zone: 1.60, move: 1.60, dur: 1.2 },
    slow:   { dur: 1.35 },
    fast:   { dur: 0.75 },
    tight:  { zone: 0.60, move: 0.55, dur: 0.95 }
  };

  // Target elements: anything with `.be-magnetic`
  var els = Array.prototype.slice.call(document.querySelectorAll(".be-magnetic"));
  if (!els.length) return;

  function computeConfig(el) {
    var zoneF = 1, moveF = 1, durF = 1;

    if (el.classList.contains("be-magnetic--subtle")) {
      zoneF *= MODS.subtle.zone; moveF *= MODS.subtle.move; durF *= MODS.subtle.dur;
    }
    if (el.classList.contains("be-magnetic--strong")) {
      zoneF *= MODS.strong.zone; moveF *= MODS.strong.move; durF *= MODS.strong.dur;
    }
    if (el.classList.contains("be-magnetic--tight")) {
      zoneF *= MODS.tight.zone; moveF *= MODS.tight.move; durF *= MODS.tight.dur;
    }
    if (el.classList.contains("be-magnetic--slow")) durF *= MODS.slow.dur;
    if (el.classList.contains("be-magnetic--fast")) durF *= MODS.fast.dur;

    // Build final config
    return {
      triggerDistRem: base.triggerDistRem * zoneF,
      maxMoveRem: base.maxMoveRem * moveF,
      durXY: base.durXY * durF,
      easeXY: base.easeXY
    };
  }

  var items = els.map(function (el) {
    var cfg = computeConfig(el);

    return {
      el: el,
      cfg: cfg,
      rect: null,
      cx: 0,
      cy: 0,

      // px values derived from rem (recomputed on resize)
      triggerDist: remToPx(cfg.triggerDistRem),
      maxMove: remToPx(cfg.maxMoveRem),

      xTo: gsap.quickTo(el, "x", { duration: cfg.durXY, ease: cfg.easeXY }),
      yTo: gsap.quickTo(el, "y", { duration: cfg.durXY, ease: cfg.easeXY })
    };
  });

  function updateRects() {
    items.forEach(function (it) {
      it.rect = it.el.getBoundingClientRect();
      it.cx = it.rect.left + it.rect.width / 2;
      it.cy = it.rect.top + it.rect.height / 2;
    });
  }

  function updatePxValues() {
    items.forEach(function (it) {
      it.triggerDist = remToPx(it.cfg.triggerDistRem);
      it.maxMove = remToPx(it.cfg.maxMoveRem);
    });
  }

  updatePxValues();
  updateRects();

  window.addEventListener("resize", function () {
    // in case classes changed dynamically, recompute configs too
    items.forEach(function (it) {
      it.cfg = computeConfig(it.el);
      it.triggerDist = remToPx(it.cfg.triggerDistRem);
      it.maxMove = remToPx(it.cfg.maxMoveRem);

      // refresh quickTo duration if needed
      it.xTo = gsap.quickTo(it.el, "x", { duration: it.cfg.durXY, ease: it.cfg.easeXY });
      it.yTo = gsap.quickTo(it.el, "y", { duration: it.cfg.durXY, ease: it.cfg.easeXY });
    });

    updateRects();
  }, { passive: true });

  // For sticky header / layout shifts on scroll
  window.addEventListener("scroll", function () {
    updateRects();
  }, { passive: true });

  var mouseX = 0, mouseY = 0;
  var ticking = false;

  function process() {
    ticking = false;

    items.forEach(function (it) {
      var r = it.rect;
      if (!r) return;

      var td = it.triggerDist;

      // Zone = rect expanded by triggerDist
      var inZone =
        mouseX >= r.left - td &&
        mouseX <= r.right + td &&
        mouseY >= r.top - td &&
        mouseY <= r.bottom + td;

      if (!inZone) {
        it.xTo(0);
        it.yTo(0);
        return;
      }

      // Normalize with triggerDist for smooth ramp
      var halfW = r.width / 2 + td;
      var halfH = r.height / 2 + td;

      var nx = (mouseX - it.cx) / halfW;
      var ny = (mouseY - it.cy) / halfH;

      var tx = gsap.utils.clamp(-1, 1, nx) * it.maxMove;
      var ty = gsap.utils.clamp(-1, 1, ny) * it.maxMove;

      it.xTo(tx);
      it.yTo(ty);
    });
  }

  function onPointerMove(e) {
    // mouse only (avoid touch/pen wobble)
    if (e.pointerType && e.pointerType !== "mouse") return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(process);
    }
  }

  document.addEventListener("pointermove", onPointerMove, { passive: true });

  window.addEventListener("blur", function () {
    items.forEach(function (it) {
      it.xTo(0);
      it.yTo(0);
    });
  });
})();