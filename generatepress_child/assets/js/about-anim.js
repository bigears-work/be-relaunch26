/**
 * Big Ears Webagentur - About Section Reveal v1.3
 *
 * Scroll-gebundene 2-Spalten-Animation – analog Card Grid & Hero:
 *  -> scrub: 1.5  (konsistent mit card-reveal.js + hero-anim.js)
 *  -> #bio-img:  fade-in + slide from left  (x: -40)
 *  -> #bio-txt:  Kinder gestaggert fade-in + slide up (y: 32)
 *  -> kein autoplay, kein once
 *
 * Selektoren:
 *  Trigger:    #about
 *  Bild:       #bio-img
 *  Text-Kinder: direkte Kinder von #bio-txt in DOM-Reihenfolge
 *
 * @requires GSAP 3.12+, ScrollTrigger
 */
document.addEventListener( 'DOMContentLoaded', () => {

    if ( ! window.gsap || ! window.ScrollTrigger ) return;
    gsap.registerPlugin( ScrollTrigger );

    if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

    const section = document.querySelector( '#about' );
    const image   = document.querySelector( '#bio-img' );
    const textEls = document.querySelectorAll( '#bio-txt > *' );

    if ( ! section || ! image || ! textEls.length ) return;

    // --- Initialzustand ---
    gsap.set( image, {
        autoAlpha: 0,
        x:         -40,
    } );

    gsap.set( textEls, {
        autoAlpha: 0,
        y:         32,   // identisch card-reveal.js
    } );

    // --- ScrollTrigger Timeline ---
    const tl = gsap.timeline( {
        scrollTrigger: {
            trigger:             section,
            start:               'top 80%',
            end:                 'top 5%',
            scrub:               1.5,
            invalidateOnRefresh: true,
        },
    } );

    // Bild gleitet von links — startet sofort
    tl.to( image, {
        autoAlpha: 1,
        x:         0,
        ease:      'power2.out',
    }, 0 );

    // Direkte Kinder von #bio-txt gestaggert — 1 Tick versetzt
    tl.to( textEls, {
        autoAlpha: 1,
        y:         0,
        ease:      'power2.out',
        stagger: {
            amount: 0.6,
            from:   'start',   // identisch card-reveal.js
        },
    }, 0.1 );

    // --- Refresh ---
    window.addEventListener( 'load', function() {
        ScrollTrigger.refresh();
    }, { once: true } );

    var resizeTimer;
    window.addEventListener( 'resize', function() {
        clearTimeout( resizeTimer );
        resizeTimer = setTimeout( function() { ScrollTrigger.refresh(); }, 150 );
    }, { passive: true } );

} );