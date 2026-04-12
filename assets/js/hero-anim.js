/**
 * Big Ears Webagentur - Hero Animation v5.3
 *
 * "Du brauchst eine Website, keine Baustelle."
 *  -> Logo + H1 fallen raus
 *  -> "keine" faded aus
 *  -> "Baustelle" zerfaellt (Drop & Shatter)
 *
 * @requires GSAP 3.12+, ScrollTrigger, SplitText
 */
document.addEventListener( 'DOMContentLoaded', () => {
	if ( ! window.gsap || ! window.ScrollTrigger || ! window.SplitText ) return;
	gsap.registerPlugin( ScrollTrigger, SplitText );

	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

	// Elemente
	const hero  = document.querySelector( '#home-hero' );
	const claim = document.querySelector( '.gbp-text--focus' );

	const headerEls = [
		document.querySelector( 'header.gb-site-header > .gbp-logo .custom-logo' ),
	].filter( Boolean );

	if ( ! hero || ! claim ) return;

	// Claim-Text bereinigen (falls Leerzeichen vor Komma noch drin)
	claim.innerHTML = claim.innerHTML.replace( ' ,', ',' );

	// SplitText
	const splitWords    = SplitText.create( claim, { type: 'words' } );
	const words         = splitWords.words;

	const wordKeine     = Array.from( words ).find( function( w ) { return w.textContent.trim() === 'keine'; } );
	const wordBaustelle = words[ words.length - 1 ];
	const splitChars    = SplitText.create( wordBaustelle, { type: 'chars' } );
	const chars         = splitChars.chars;

	// Initialzustand
	if ( headerEls.length ) {
		gsap.set( headerEls, { autoAlpha: 1 } );
	}

	// Scrollstrecke in vh
const isTouch = window.matchMedia( '(pointer: coarse)' ).matches;

const totalDistance = function() {
    const ratio = window.innerWidth / window.innerHeight;
    const vh    = Math.round( gsap.utils.clamp( isTouch ? 40 : 5, 80, ratio * 100 ) );
    return Math.round( window.innerHeight * ( vh / 100 ) );
};

	// Haupttimeline
const tl = gsap.timeline( {
    scrollTrigger: {
        trigger:             hero,
        start:               'top top',
        end:                 function() { return '+=' + totalDistance(); },
        pin:                 true,
        pinSpacing:          true,
        scrub:               isTouch ? 3 : 1.5,
        anticipatePin:       1,
        invalidateOnRefresh: true,
    },
} );

// Logo Exit (startet bei 0)
if ( headerEls.length ) {
    tl.to( headerEls, {
        autoAlpha: 0,
        ease:      'power2.in',
    }, 0 );
}

// "keine" faded aus (ebenfalls bei 0)
if ( wordKeine ) {
    tl.to( wordKeine, {
        autoAlpha: 0,
        ease:      'power2.in',
    }, 0 );
}

// Drop & Shatter
tl.to( chars, {
    y:         function() { return gsap.utils.random( 80, 300 ); },
    x:         function() { return gsap.utils.random( -60, 60 ); },
    rotation:  function() { return gsap.utils.random( -45, 45 ); },
    autoAlpha: 0,
    ease:      'power3.in',
    stagger: {
        amount: 0.15,
        from:   'random',
    },
}, 0.4 );

	// Load
	window.addEventListener( 'load', function() {
		ScrollTrigger.refresh();
	}, { once: true } );

	// Resize
	var resizeTimer;
	window.addEventListener( 'resize', function() {
		clearTimeout( resizeTimer );
		resizeTimer = setTimeout( function() { ScrollTrigger.refresh(); }, 150 );
	}, { passive: true } );

} );