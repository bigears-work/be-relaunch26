/**
 * Big Ears Webagentur - Card Grid Reveal v1.1
 *
 * Scroll-gebundener Stagger – analog zur Hero Animation:
 *  -> scrub: 1.5 (wie Hero)
 *  -> Cards tauchen nacheinander auf während man scrollt
 *  -> kein autoplay, kein once
 *
 * @requires GSAP 3.12+, ScrollTrigger
 */
document.addEventListener( 'DOMContentLoaded', () => {

	if ( ! window.gsap || ! window.ScrollTrigger ) return;

	gsap.registerPlugin( ScrollTrigger );

	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

	const grids = document.querySelectorAll( '.gbp-section__inner' );

	if ( ! grids.length ) return;

	grids.forEach( ( grid ) => {

		const cards = grid.querySelectorAll( '.gbp-card__stagger' );

		if ( ! cards.length ) return;

		gsap.set( cards, {
			autoAlpha: 0,
			y:         32,
		} );

		const tl = gsap.timeline( {
			scrollTrigger: {
				trigger:             grid,
				start:               'top 80%',
				end:                 'top 5%',
				scrub:               1.5,
				invalidateOnRefresh: true,
			},
		} );

		tl.to( cards, {
			autoAlpha: 1,
			y:         0,
			ease:      'power2.out',
			stagger: {
				amount: cards.length * 0.4,
				from:   'start',
			},
		} );

	} );

	window.addEventListener( 'load', function () {
		ScrollTrigger.refresh();
	}, { once: true } );

	var resizeTimer;
	window.addEventListener( 'resize', function () {
		clearTimeout( resizeTimer );
		resizeTimer = setTimeout( function () { ScrollTrigger.refresh(); }, 150 );
	}, { passive: true } );

} );