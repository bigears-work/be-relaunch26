( function () {
    if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) return;

    const SELECTOR = '.has-card-spotlight .gbp-card, .card-spotlight-target';

    function attach( el ) {
        el.addEventListener( 'mousemove', function ( e ) {
            const rect = el.getBoundingClientRect();
            const x    = ( ( e.clientX - rect.left ) / rect.width  * 100 ).toFixed( 2 ) + '%';
            const y    = ( ( e.clientY - rect.top  ) / rect.height * 100 ).toFixed( 2 ) + '%';
            el.style.setProperty( '--spotlight-x', x );
            el.style.setProperty( '--spotlight-y', y );
        } );
    }

    document.querySelectorAll( SELECTOR ).forEach( attach );

    if ( 'MutationObserver' in window ) {
        new MutationObserver( function ( mutations ) {
            mutations.forEach( function ( m ) {
                m.addedNodes.forEach( function ( node ) {
                    if ( node.nodeType !== 1 ) return;
                    node.querySelectorAll( SELECTOR ).forEach( attach );
                    if ( node.matches( SELECTOR ) ) attach( node );
                } );
            } );
        } ).observe( document.body, { childList: true, subtree: true } );
    }
} )();