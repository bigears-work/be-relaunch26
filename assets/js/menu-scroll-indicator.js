document.addEventListener("DOMContentLoaded", function () {
    if (!window.gsap || !window.ScrollTrigger) return; // fail gracefully
    gsap.registerPlugin(ScrollTrigger);

    const navItems = document.querySelectorAll("nav .menu-item");
    const sections = [];
    let homeMenuItem = null;

    // Collect tracked sections and detect a Home link
    navItems.forEach((item) => {
        const link = item.querySelector("a");
        if (!link) return;

        const href = link.getAttribute("href") || "";
        let linkUrl;
        try {
            linkUrl = new URL(href, window.location.origin);
        } catch {
            return;
        }

        const hash = linkUrl.hash; // "", "#", or "#section"
        if (hash && hash !== "#") {
            const el = document.querySelector(hash);
            if (el) sections.push({ id: hash, element: el, menuItem: item });
        } else {
            const linkBase = linkUrl.origin + linkUrl.pathname + linkUrl.search;
            const pageBase =
                window.location.origin +
                window.location.pathname +
                window.location.search;

            const looksLikeHome =
                ((hash === "" || hash === "#") && linkBase === pageBase) ||
                href === "#" ||
                href === "/#";

            if (looksLikeHome) homeMenuItem = item;
        }
    });

    // If no sections on this page, bail (preserve WP defaults)
    if (sections.length === 0) return;

    const baseUrl =
        window.location.origin + window.location.pathname + window.location.search;

    function clearTracked() {
        sections.forEach((s) => s.menuItem.classList.remove("current-menu-item"));
        if (homeMenuItem) homeMenuItem.classList.remove("current-menu-item");
    }

    function setActive(sectionId) {
        clearTracked();

        if (sectionId) {
            const found = sections.find((s) => s.id === sectionId);
            if (found) found.menuItem.classList.add("current-menu-item");
            if (history.replaceState) history.replaceState(null, "", baseUrl + sectionId);
        } else {
            if (homeMenuItem) homeMenuItem.classList.add("current-menu-item");
            if (history.replaceState) history.replaceState(null, "", baseUrl); // clean URL, no hash
        }
    }

    // Create one ScrollTrigger per section
    sections.forEach((s) => {
        ScrollTrigger.create({
            trigger: s.element,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActive(s.id),
            onEnterBack: () => setActive(s.id),
            onLeave: checkNoneActive,
            onLeaveBack: checkNoneActive,
            _isSection: true
        });
    });

    function checkNoneActive() {
        const anyActive = ScrollTrigger.getAll().some(
            (t) => t.vars && t.vars._isSection && t.isActive
        );
        if (!anyActive) setActive(null);
    }

    // Initial state
    const initialHash = window.location.hash;
    if (initialHash && initialHash !== "#" && sections.some((s) => s.id === initialHash)) {
        setActive(initialHash);
        requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
        setActive(null);
        ScrollTrigger.refresh();
    }
});