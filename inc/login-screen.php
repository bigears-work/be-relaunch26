<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// Link login logo to the site home
add_filter( 'login_headerurl', fn() => home_url( '/' ) );

// Title attribute for the logo
add_filter( 'login_headertext', fn() => get_bloginfo( 'name' ) );

// Enqueue CSS + inject dynamic logo from Customizer
add_action( 'login_enqueue_scripts', function () {
    // Enqueue your theme CSS for the login screen
    wp_enqueue_style(
        'child-login-styles',
        get_stylesheet_directory_uri() . '/assets/css/login-styles.css',
        [],
        wp_get_theme()->get( 'Version' )
    );

    // Pull Customizer site logo
    $logo_id = get_theme_mod( 'custom_logo' );
    if ( $logo_id ) {
        $img = wp_get_attachment_image_src( $logo_id, 'full' );
        if ( $img ) {
            $logo_src = esc_url( $img[0] );
            $logo_h   = min( (int) $img[2], 140 ); // cap so it doesn’t get huge
            ?>
            <style>
                body.login h1 a {
                    background-image: url('<?php echo $logo_src; ?>') !important;
                    background-size: contain !important;
                    background-position: center center !important;
                    background-repeat: no-repeat !important;
                    width: 100% !important;
                    height: <?php echo $logo_h; ?>px !important;
                    text-indent: -9999px;
                    overflow: hidden;
                }
            </style>
            <?php
        }
    }
});
