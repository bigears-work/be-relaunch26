/**
 * Big Ears Webagentur - Logo Animation
 *
 * Logo fades out on scroll — runs on all pages.
 *
 * @requires GSAP 3.12+, ScrollTrigger
 */
document.addEventListener( 'DOMContentLoaded', () => {
	if ( ! window.gsap || ! window.ScrollTrigger ) return;
	gsap.registerPlugin( ScrollTrigger );

	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

	const logo = document.querySelector( 'header.gb-site-header > .gbp-logo .custom-logo' );
	if ( ! logo ) return;

	const isTouch = window.matchMedia( '(pointer: coarse)' ).matches;

	gsap.timeline( {
		scrollTrigger: {
			trigger:             document.body,
			start:               'top top',
			end:                 '+=200',
			scrub:               isTouch ? 3 : 1.5,
			invalidateOnRefresh: true,
		},
	} ).to( logo, {
		autoAlpha: 0,
		ease:      'power2.in',
	} );
} );
