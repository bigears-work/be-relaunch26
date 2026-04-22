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
} );