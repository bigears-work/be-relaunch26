/**
 * Big Ears Webagentur - Hero Animation v5.5
 *
 * "Du brauchst eine Website, keine Baustelle."
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

	// Haupttimeline — scrub ohne pin: Animationszustand folgt der Scrollposition
	const tl = gsap.timeline( {
		scrollTrigger: {
			trigger: hero,
			start:   'top top',
			end:     '+=300',
			scrub:   1,
		},
	} );

	// "keine" faded aus (bei 0)
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

} );
