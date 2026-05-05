<?php
add_action( 'wp_enqueue_scripts', function () {
    $uri  = get_stylesheet_directory_uri();
    $path = get_stylesheet_directory();
    $v = static function ( string $file ) use ( $path ) {
        $abs = $path . $file;
        return file_exists( $abs ) ? filemtime( $abs ) : false;
    };

    wp_enqueue_script( 'gsap',               $uri . '/assets/gsap/gsap.min.js',         [],         '3.12.2', true );
    wp_enqueue_script( 'gsap-scrolltrigger', $uri . '/assets/gsap/ScrollTrigger.min.js', [ 'gsap' ], '3.12.2', true );
    wp_enqueue_script( 'gsap-splittext',     $uri . '/assets/gsap/SplitText.min.js',     [ 'gsap' ], '3.12.2', true );

    wp_enqueue_script( 'magnetic-btn',
        $uri . '/assets/js/magnetic-btn.js',
        [ 'gsap' ],
        $v( '/assets/js/magnetic-btn.js' ),
        true
    );

    wp_enqueue_script( 'magnetic-sound',
        $uri . '/assets/js/magnetic-sound.js',
        [ 'magnetic-btn' ],
        $v( '/assets/js/magnetic-sound.js' ),
        true
    );

    wp_enqueue_script( 'menu-scroll-indicator',
        $uri . '/assets/js/menu-scroll-indicator.js',
        [ 'gsap-scrolltrigger' ],
        $v( '/assets/js/menu-scroll-indicator.js' ),
        true
    );

    if ( is_front_page() ) {
        wp_enqueue_script( 'hero-morph',
            $uri . '/assets/js/hero-anim.js',
            [ 'gsap-scrolltrigger', 'gsap-splittext' ],
            $v( '/assets/js/hero-anim.js' ),
            true
        );
    }

    wp_enqueue_script( 'gbp-card-reveal',
        $uri . '/assets/js/card-reveal.js',
        [ 'gsap-scrolltrigger' ],
        $v( '/assets/js/card-reveal.js' ),
        true
    );

    wp_enqueue_script( 'logo-anim',
        $uri . '/assets/js/logo-anim.js',
        [ 'gsap-scrolltrigger' ],
        $v( '/assets/js/logo-anim.js' ),
        true
    );

    // ─── Glow Effects (page-conditional) ─────────────────────────
    if ( bew_page_has_class( 'has-card-spotlight' ) ) {
        wp_enqueue_style(  'card-spotlight',    $uri . '/assets/css/card-spotlight.css', [], $v( '/assets/css/card-spotlight.css' ) );
        wp_enqueue_script( 'card-spotlight-js', $uri . '/assets/js/card-spotlight.js',  [], $v( '/assets/js/card-spotlight.js' ),  true );
    }

    if ( bew_page_has_class( 'glow-border-target' ) ) {
        wp_enqueue_style( 'glow-border', $uri . '/assets/css/glow-border.css', [], $v( '/assets/css/glow-border.css' ) );
    }
} );

/**
 * Prüft ob eine CSS-Klasse im post_content vorkommt.
 * GenerateBlocks schreibt Block-Klassen direkt in post_content —
 * str_contains() reicht, kein vollständiger HTML-Parse nötig.
 */
function bew_page_has_class( string $class ): bool {
    global $post;
    if ( ! ( $post instanceof WP_Post ) ) {
        return false;
    }
    return str_contains( $post->post_content, $class );
}